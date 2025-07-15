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

  const allFlightCards: FlightCard[] = useMemo(() => { // 👈 Added type annotation here
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
    // Only open the sheet initially if there are any flight cards from the AI and the user hasn't closed it.
    // The sheet should remain open even if filters result in no matches.
    const hasInitialCards = allFlightCards.length > 0;
    if (hasInitialCards && !userClosedSheetRef.current) {
      sheetRef.current?.expand?.();
    } else if (!hasInitialCards) {
      sheetRef.current?.close?.();
    }
  }, [allFlightCards]); // Dependent on the original, unfiltered flight cards

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
    setAppliedFilters({}); // Reset filters when a new search is performed

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
        userClosedSheetRef.current = false; // Reset the flag when new cards arrive
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
    // After applying filters, we want to ensure the sheet remains open
    // and shows the (potentially empty) filtered results.
    // The onBackToResults in FlightFiltersPanel will handle switching view.
    sheetRef.current?.expand(); // Ensure the sheet is expanded (or remains expanded)
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
        keyboardVerticalOffset={insets.top + 50}
      >
        <View style={styles.chatContainer}>
          <PromptSelector onPromptSend={handleSend} overridePrompts={dynamicPrompts} />
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={{ padding: 10 }}
          />
        </View>

        <View style={{ paddingBottom: insets.bottom || 10 }}>
          <BlurView style={styles.inputContainer} blurType="dark" blurAmount={20}>
            <TextInput
              style={styles.input}
              placeholder="Ask AI to plan your trip..."
              placeholderTextColor="#aaa"
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
    backgroundColor: '#121212',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  filterButton: {
    padding: 10,
    backgroundColor: 'rgba(0, 191, 255, 0.3)',
    borderRadius: 10,
  },
  filterButtonText: {
    color: '#00bfff',
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  message: {
    padding: 12,
    borderRadius: 14,
    marginVertical: 4,
    maxWidth: '75%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#FFFFFF',
    backgroundColor: 'rgba(32, 162, 243, 0.2)',
    fontSize: 16,
    fontWeight: '500',
    padding: 8,
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    maxHeight: 120,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#00bfff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatScreen;