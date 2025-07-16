// ChatScreen.tsx
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

// Import your theme variables
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
}

const ChatScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<Record<string, { preloadMessage?: string }>, string>>();
  const preloadedMessage = route.params?.preloadMessage ?? '';
  const [messages, setMessages] = useState<Message[]>([]);
  const [dynamicPrompts, setDynamicPrompts] = useState<string[]>([]);
  const [input, setInput] = useState('');
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

    setLoading(true);
    setDynamicPrompts([]);
    setAppliedFilters({});

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
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: '⚠️ There was an error talking to AI. Please try again later.' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.message,
        item.sender === 'user' ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

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
        keyboardVerticalOffset={insets.top + Spacing.xl * 2} // Adjusted offset using Spacing
      >
        <View style={styles.chatContainer}>
          <PromptSelector onPromptSend={handleSend} overridePrompts={dynamicPrompts} />
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={{ padding: Spacing.md }} // Using Spacing
          />
        </View>

        <View style={{ paddingBottom: insets.bottom || Spacing.md }}> {/* Using Spacing */}
          <BlurView style={styles.inputContainer} blurType="dark" blurAmount={20}>
            <TextInput
              style={styles.input}
              placeholder="Ask AI to plan your trip..."
              placeholderTextColor={Colors.textMuted} // Using Colors variable
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
    backgroundColor: Colors.background, // Using Colors variable
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md, // Using Spacing
    marginTop: Spacing.md, // Using Spacing
  },
  backButton: {
    padding: Spacing.md, // Using Spacing
    backgroundColor: Colors.userBubble, // Using Colors variable
    borderRadius: BorderRadius.lg, // Using BorderRadius
  },
  backButtonText: {
    color: Colors.text, // Using Colors variable
    fontWeight: '600',
  },
  filterButton: {
    padding: Spacing.md, // Using Spacing
    backgroundColor: Colors.aiBubble, // Reusing aiBubble color for consistency
    borderRadius: BorderRadius.lg, // Using BorderRadius
  },
  filterButtonText: {
    color: Colors.primary, // Using Colors variable
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
    marginHorizontal: Spacing.md, // Using Spacing
    marginBottom: Spacing.md, // Using Spacing
    borderRadius: BorderRadius.xl, // Using BorderRadius
    overflow: 'hidden',
  },
  message: {
    padding: Spacing.lg, // Using Spacing
    borderRadius: BorderRadius.lg, // Using BorderRadius
    marginVertical: Spacing.xs, // Using Spacing
    maxWidth: '75%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    color: Colors.text, // Using Colors variable
    backgroundColor: Colors.aiBubble, // Using Colors variable (already ai bubble)
    fontSize: FontSize.md, // Using FontSize
    fontWeight: '500',
    padding: Spacing.sm, // Using Spacing
    borderRadius: BorderRadius.lg, // Using BorderRadius
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md, // Using Spacing
    borderRadius: BorderRadius.xl, // Using BorderRadius
    backgroundColor: Colors.borderColor, // Using Colors variable for border/input background
  },
  input: {
    flex: 1,
    color: Colors.text, // Using Colors variable
    fontSize: FontSize.md, // Using FontSize
    paddingVertical: Spacing.sm, // Using Spacing
    paddingHorizontal: Spacing.lg, // Using Spacing
    borderRadius: BorderRadius.lg, // Using BorderRadius
    maxHeight: 120,
  },
  sendButton: {
    marginLeft: Spacing.md, // Using Spacing
    backgroundColor: Colors.primary, // Using Colors variable
    borderRadius: BorderRadius.lg, // Using BorderRadius
    paddingVertical: Spacing.md, // Using Spacing
    paddingHorizontal: Spacing.lg, // Using Spacing
  },
  sendButtonText: {
    color: Colors.buttonText, // Using Colors variable
    fontWeight: 'bold',
  },
});

export default ChatScreen;