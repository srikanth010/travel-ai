import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import PromptSelector from '../components/PromptSelector';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  NavigationProp,
  RouteProp,
} from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import axios from 'axios';
import FlightResultsSheet from '../components/FlightResultsSheet';

import { Colors, Spacing, BorderRadius, FontSize } from '../theme/styles';

interface FilterOptions {
  airlines?: string[];
  bagsIncluded?: boolean;
  cabins?: string[];
  duration?: { min?: number; max?: number };
  price?: { min?: number; max?: number };
  stops?: number[];
}

interface FlightCard {
  airline: string;
  origin: string;
  destination: string;
  departureDateTime: string;
  returnDateTime: string;
  price: number;
  segments: number;
  durationMinutes: number;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  cards?: FlightCard[];
  isTypingIndicator?: boolean;
}

const ChatScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<Record<string, { preloadMessage?: string }>, string>>();
  const preloadedMessage = route.params?.preloadMessage ?? '';
  const [messages, setMessages] = useState<Message[]>([]);
  const [dynamicPrompts, setDynamicPrompts] = useState<string[]>([]);
  const [input, setInput] = useState(''); // This state will now also be updated by prompts
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const hasPreloaded = useRef(false);
  const sheetRef = useRef<any>(null);
  const userClosedSheetRef = useRef(false);

  const [availableFiltersOptions, setAvailableFiltersOptions] = useState<FilterOptions>({});
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>({});

  const allFlightCards: FlightCard[] = useMemo(() => {
    return messages
      .filter((m) => m.sender === 'ai' && Array.isArray(m.cards) && m.cards.length > 0)
      .flatMap((m) => m.cards || []);
  }, [messages]);

  const flightCards = useMemo(() => {
    let filteredCards: FlightCard[] = allFlightCards;

    if (appliedFilters.airlines?.length) {
      filteredCards = filteredCards.filter(card => appliedFilters.airlines!.includes(card.airline));
    }

    if (appliedFilters.stops?.length) {
      filteredCards = filteredCards.filter(card => appliedFilters.stops!.includes(card.segments - 1));
    }

    if (appliedFilters.price) {
      const { min, max } = appliedFilters.price;
      if (min !== undefined) filteredCards = filteredCards.filter(card => card.price >= min);
      if (max !== undefined) filteredCards = filteredCards.filter(card => card.price <= max);
    }

    return filteredCards;
  }, [allFlightCards, appliedFilters]);

  useEffect(() => {
    const hasInitialCards = allFlightCards.length > 0;
    if (hasInitialCards && !userClosedSheetRef.current) {
      sheetRef.current?.expand?.();
    } else if (!hasInitialCards) {
      sheetRef.current?.close?.();
    }
  }, [allFlightCards]);

  useEffect(() => {
    if (preloadedMessage && !hasPreloaded.current) {
      const reformattedPrompt = `
Give a short, timely reason why ${preloadedMessage} is a trending destination.
Mention current events, weather, or affordability if relevant.
Keep it under 2 sentences.
Then ask: "Want me to plan your trip or find the cheapest way to go?".
`;
      handleSend(reformattedPrompt, false);
      hasPreloaded.current = true;
    }
  }, [preloadedMessage, handleSend]);

  const handleSend = useCallback(async (overrideText?: string, showUserMessage: boolean = true) => {
    const textToSend = overrideText ?? input;
    if (!textToSend.trim()) return;

    if (showUserMessage) {
      setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
      setInput('');
    }

    Keyboard.dismiss();

    setLoading(true);
    setDynamicPrompts([]); // Clear prompts when a new message is sent
    setAppliedFilters({});

    setMessages(prev => [...prev, { sender: 'ai', text: 'AI is thinking...', isTypingIndicator: true }]);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await axios.post('https://local.trvlora.com/chat', {
        message: textToSend,
      });

      const replyText = response?.data?.reply ?? 'Sorry, something went wrong.';
      const prompts = response?.data?.prompts ?? [];

      const rawCards = Array.isArray(response?.data?.cards?.flights)
        ? response.data.cards.flights
        : [];
      const filtersData = response?.data?.cards?.filters ?? {};
      setAvailableFiltersOptions(filtersData);

      const transformedCards: FlightCard[] = rawCards.map((card: any) => ({
        airline: card.airline,
        price: parseFloat(card.price),
        origin: card.departure,
        destination: card.arrival,
        departureDateTime: card.departureDateTime,
        returnDateTime: card.returnDateTime,
        segments: card.segments,
        durationMinutes: card.durationMinutes,
      }));

      if (transformedCards.length > 0) {
        userClosedSheetRef.current = false;
      }

      setMessages(prev => prev.filter(msg => !msg.isTypingIndicator));
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: replyText.trim(),
          cards: transformedCards,
        },
      ]);

      const isTravelPrompt = (p: string) =>
        ['flight', 'hotel', 'visa', 'travel', 'trip', 'itinerary', 'places'].some(k =>
          p.toLowerCase().includes(k)
        );
      setDynamicPrompts(prompts.filter(isTravelPrompt));

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      console.error('AI Error:', err);
      setMessages(prev => prev.filter(msg => !msg.isTypingIndicator));
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: '⚠️ There was an error talking to AI. Please try again later.' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input]);

  // NEW HANDLER: To update the input box
  const handlePromptSelectForInput = useCallback((prompt: string) => {
    setInput(prompt); // Set the input state to the selected prompt text
  }, []);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    if (item.isTypingIndicator) {
      return (
        <View style={[styles.message, styles.aiMessage, styles.typingIndicatorContainer]}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.typingIndicatorText}>AI is thinking...</Text>
        </View>
      );
    }
    return (
      <View
        style={[
          styles.message,
          item.sender === 'user' ? styles.userMessage : styles.aiMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  }, []);

  const handleApplyFilters = useCallback((filters: FilterOptions) => {
    setAppliedFilters(filters);
    sheetRef.current?.expand();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => sheetRef.current?.showFilters?.()}
        >
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + Spacing.xl * 2}
      >
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={{ padding: Spacing.md }}
          />
        </View>

        {dynamicPrompts.length > 0 && (
          <View style={styles.promptSelectorWrapper}>
            <PromptSelector
              onPromptSend={handleSend} // Keep this for now, though it's not the primary action for AI prompts
              onPromptSelectForInput={handlePromptSelectForInput} // <--- Pass the new handler
              overridePrompts={dynamicPrompts}
            />
          </View>
        )}

        <View style={{ paddingBottom: insets.bottom || Spacing.md }}>
          <BlurView style={styles.inputContainer} blurType="dark" blurAmount={20}>
            <TextInput
              style={styles.input}
              placeholder="Ask AI to plan your trip..."
              placeholderTextColor={Colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </KeyboardAvoidingView>

      <FlightResultsSheet
        ref={sheetRef}
        cards={flightCards}
        availableFilters={availableFiltersOptions}
        initialFilters={appliedFilters}
        onApplyFilters={handleApplyFilters}
        onClose={() => {
          userClosedSheetRef.current = true;
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  backButton: {
    padding: Spacing.md,
    backgroundColor: Colors.userBubble,
    borderRadius: BorderRadius.lg,
  },
  backButtonText: {
    color: Colors.text,
    fontWeight: '600',
  },
  filterButton: {
    padding: Spacing.md,
    backgroundColor: Colors.aiBubble,
    borderRadius: BorderRadius.lg,
  },
  filterButtonText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  message: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.xs,
    maxWidth: '75%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    color: Colors.text,
    backgroundColor: Colors.aiBubble,
    fontSize: FontSize.md,
    fontWeight: '500',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  promptSelectorWrapper: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.borderColor,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    maxHeight: 120,
  },
  sendButton: {
    marginLeft: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  sendButtonText: {
    color: Colors.buttonText,
    fontWeight: 'bold',
  },
  typingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.aiBubble,
    borderRadius: BorderRadius.lg,
    maxWidth: '50%',
  },
  typingIndicatorText: {
    marginLeft: Spacing.xs,
    color: Colors.text,
    fontSize: FontSize.sm,
    fontStyle: 'italic',
  },
});

export default ChatScreen;