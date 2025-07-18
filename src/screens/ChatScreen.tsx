// Full updated ChatScreen.tsx with prepopulated message and typing indicator fix

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
import FlightCardsDisplay from '../components/FlightCardsDisplay';
import { Colors, Spacing, BorderRadius, FontSize } from '../theme/styles';

interface FlightSegment {
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDateTime: string;
  arrivalDateTime: string;
  durationMinutes: number;
  aircraft?: string | null;
  amenities?: string[];
  emissions?: {
    value: number;
    unit: string;
    description?: string;
  };
}

interface FlightCard {
  airline: string;
  origin: string;
  destination: string;
  departureDateTime: string;
  returnDateTime?: string | null;
  price: number;
  segments: number;
  durationMinutes: number;
  outboundSegments: FlightSegment[];
  returnSegments?: FlightSegment[];
}

interface FilterOptions {
  airlines?: string[];
  bagsIncluded?: boolean;
  cabins?: string[];
  duration?: { min?: number; max?: number };
  price?: { min?: number; max?: number };
  stops?: number[];
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
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hi! 👋 I can help you plan your trip. Try asking something like:\n\n✈️ Find flights from NYC to Paris\n🏨 Show hotels in Rome\n📍Top places to visit in Tokyo",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dynamicPrompts, setDynamicPrompts] = useState<string[]>([]);
  const [availableFiltersOptions, setAvailableFiltersOptions] = useState<FilterOptions>({});
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>({});
  const hasPreloaded = useRef(false);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const allFlightCards: FlightCard[] = useMemo(() => {
    return messages
      .filter((m) => m.sender === 'ai' && Array.isArray(m.cards) && m.cards.length > 0)
      .flatMap((m) => m.cards || []);
  }, [messages]);

  const flightCards = useMemo(() => {
    let filteredCards = allFlightCards;
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
    if (preloadedMessage && !hasPreloaded.current) {
      const reformattedPrompt = `
Give a short, timely reason why ${preloadedMessage} is a trending destination.
Mention current events, weather, or affordability if relevant.
Keep it under 2 sentences.
Then ask: "Want me to plan your trip or find the cheapest way to go?".`;
      handleSend(reformattedPrompt, false);
      hasPreloaded.current = true;
    }
  }, [preloadedMessage]);

  const handleSend = useCallback(async (overrideText?: string, showUserMessage = true) => {
    const textToSend = overrideText ?? input;
    if (!textToSend.trim()) return;

    if (showUserMessage) {
      setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
      setInput('');
    }

    Keyboard.dismiss();
    setLoading(true);
    setDynamicPrompts([]);
    setAppliedFilters({});
    setMessages(prev => [...prev, { sender: 'ai', text: 'Gathering best travel info for you...', isTypingIndicator: true }]);

    try {
      const response = await axios.post('https://local.trvlora.com/chat', { message: textToSend });
      const replyText = response?.data?.reply ?? 'Sorry, something went wrong.';
      const rawCardsData = response?.data?.cards ?? [];
      const prompts = response?.data?.prompts ?? [];
      const filtersData = response?.data?.filters ?? {};

      const transformedCards: FlightCard[] = rawCardsData.map((card: any) => ({
        airline: card.airline,
        origin: card.origin,
        destination: card.destination,
        departureDateTime: card.departureDateTime,
        returnDateTime: card.returnDateTime,
        price: parseFloat(card.price),
        segments: card.segments,
        durationMinutes: card.durationMinutes,
        outboundSegments: Array.isArray(card.outboundSegments) ? card.outboundSegments : [],
        returnSegments: Array.isArray(card.returnSegments) ? card.returnSegments : [],
      }));

      setAvailableFiltersOptions(filtersData);
      setMessages(prev => prev.filter(msg => !msg.isTypingIndicator));
      setMessages(prev => [...prev, { sender: 'ai', text: replyText.trim(), cards: transformedCards }]);
      setDynamicPrompts(prompts.filter(p => ['flight', 'hotel', 'visa', 'travel', 'trip', 'itinerary', 'places'].some(k => p.toLowerCase().includes(k))));

      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error('AI Error:', err);
      setMessages(prev => prev.filter(msg => !msg.isTypingIndicator));
      setMessages(prev => [...prev, { sender: 'ai', text: '⚠️ There was an error talking to AI. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  }, [input]);

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
      <View style={[styles.message, item.sender === 'user' ? styles.userMessage : styles.aiMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
        {item.sender === 'ai' && item.cards?.length > 0 && <FlightCardsDisplay cards={item.cards} />}
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + Spacing.xl * 2}
      >
         <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Text style={styles.backButtonText}>← Back</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Travel Chat</Text>
  </View>
        
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ padding: Spacing.md }}
        />

        {dynamicPrompts.length > 0 && (
          <View style={styles.promptSelectorWrapper}>
            <PromptSelector
              onPromptSend={handleSend}
              onPromptSelectForInput={setInput}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  message: { marginVertical: 4, maxWidth: '90%' },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.userBubble,
    padding: 10,
    borderRadius: 12,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.aiBubble,
    padding: 10,
    borderRadius: 12,
  },
  messageText: { color: Colors.text, fontSize: FontSize.md },
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
    maxHeight: 120,
  },
  sendButton: {
    marginLeft: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  sendButtonText: { color: Colors.buttonText, fontWeight: 'bold' },
  promptSelectorWrapper: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: -30, // center title visually since back button takes space
  },  
});

export default ChatScreen;
