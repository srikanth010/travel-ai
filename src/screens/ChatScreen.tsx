import React, { useState, useRef, useEffect, useCallback } from 'react'; // Add useCallback
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


interface FlightCard {
  airline: string;
  origin: string;
  destination: string;
  departureDateTime: string;
  returnDateTime: string;
  price: number;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  cards?: FlightCard; // Array of travel results (e.g., flights)
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
  const lastFlightCardCountRef = useRef(0);
  const [lastFlightCardCount, setLastFlightCardCount] = useState(0);

  
  // This `flightCards` derivation is still fine for rendering the sheet
  // However, the useEffect will now calculate them internally.
  const flightCards = messages
    .filter((m) => m.sender === 'ai' && m.cards && m.cards.length > 0)
    .flatMap((m) => m.cards);

  // ✅ CRITICAL CHANGE HERE: Depend on `messages` directly
  // In ChatScreen.tsx, the useEffect for messages:
  useEffect(() => {
    const currentFlightCards = messages
      .filter((m) => m.sender === 'ai' && Array.isArray(m.cards) && m.cards.length > 0)
      .flatMap((m) => m.cards);
  
    const hasNewCards = currentFlightCards.length > 0;
  
    if (hasNewCards && !userClosedSheetRef.current) {
      sheetRef.current?.expand?.();
    }
  
    if (!hasNewCards) {
      sheetRef.current?.close?.();
    }
  }, [messages]);


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
  }, [preloadedMessage]);


  // Wrap handleSend in useCallback to prevent unnecessary re-creations (good practice)
  const handleSend = useCallback(async (overrideText?: string, showUserMessage: boolean = true) => {
    const textToSend = overrideText ?? input; // input is a state, captured when handleSend is created unless updated via ref
    if (!textToSend.trim()) return;

    if (showUserMessage) {
      const userMessage: Message = { sender: 'user', text: textToSend };
      setMessages((prev) => [...prev, userMessage]);
      // Note: input state might be stale here if not cleared immediately.
      // If issue persists, consider clearing input via ref or a controlled component pattern more strictly.
      setInput(''); // Clearing immediately is generally fine.
    }

    setLoading(true);
    setDynamicPrompts([]);

    try {
      
      const response = await axios.post('https://southeast-can-ccd-permit.trycloudflare.com/chat', {
        message: textToSend,
      });

      console.log('Full Axios Response:', response);
      console.log('Response Data:', response?.data);
      console.log('Response Data Cards Property:', response?.data?.cards);

      const replyText = response?.data?.reply ?? 'Sorry, something went wrong.';
const prompts = response?.data?.prompts ?? [];
const rawCards = response?.data?.cards ?? [];

const transformedCards = rawCards.map((card: any) => ({
  airline: card.airline,
  price: card.price,
  origin: card.departure,
  destination: card.arrival,
  departureDateTime: card.departureDateTime,
  returnDateTime: card.returnDateTime,
}));

if (transformedCards.length > 0) {
  userClosedSheetRef.current = false; // ✅ Reset the manual close flag
}

const aiMessage: Message = {
  sender: 'ai',
  text: replyText.trim(),
  cards: transformedCards,
};

setMessages((prev) => {
  const newState = [...prev, aiMessage];
  return newState;
});

      const isTravelRelated = (prompt: string) => {
        const keywords = ['flight', 'hotel', 'visa', 'travel', 'trip', 'itinerary', 'places'];
        return keywords.some((k) => prompt.toLowerCase().includes(k));
      };
      const filteredPrompts = prompts.filter(isTravelRelated);
      setDynamicPrompts(filteredPrompts);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (err) {
      console.error('Error talking to AI:', err);
      if (axios.isAxiosError(err)) {
          console.error('Axios Error Details:', err.response?.data, err.message, err.code);
      }
      const errorMsg: Message = {
        sender: 'ai',
        text: '⚠️ There was an error talking to AI. Please try again later.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [input]); // Added input to dependencies because it's used directly in textToSend

  const renderMessage = ({ item }: { item: Message }) => {
    // ✅ Add this null/undefined check for the item itself
    if (item === undefined || item === null) {
      console.error("CRITICAL ERROR: FlatList received an undefined/null item!");
      console.log("Problematic messages array (inside renderMessage):", messages); 
      return null; 
    }
  
    // ✅ And add a log to confirm what each item looks like
    console.log('Rendering message item:', item);
  
    return (
      <View style={[
        styles.message,
        // This is where item.sender is accessed, so item must not be undefined here.
        item.sender === 'user' ? styles.userMessage : styles.aiMessage,
      ]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 50}
      >
        <View style={styles.chatContainer}>
          <PromptSelector onPromptSend={handleSend} overridePrompts={dynamicPrompts} />
          console.log('Messages array before FlatList render:', messages);
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
  onClose={() => {
    userClosedSheetRef.current = true; // ✅ Correct
    setLastFlightCardCount(flightCards.length);
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
  backButton: {
    padding: 10,
    margin: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#fff',
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
    overflow: 'hidden',
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