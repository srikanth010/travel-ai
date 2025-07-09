import React, { useState, useRef, useEffect } from 'react';
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

interface Message {
  sender: 'user' | 'ai';
  text: string;
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

  const handleSend = async (overrideText?: string, showUserMessage: boolean = true) => {
    const textToSend = overrideText ?? input;
    if (!textToSend.trim()) return;

    if (showUserMessage) {
      const userMessage: Message = { sender: 'user', text: textToSend };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
    }

    setLoading(true);

    try {
      const response = await axios.post('https://internet-consciousness-society-consider.trycloudflare.com/chat', {
        message: textToSend,
      });

      console.log('Raw API response:', response.data);

      const replyText = response?.data?.reply ?? 'Sorry, something went wrong.';
      const prompts = response?.data?.prompts ?? [];

      const aiMessage: Message = {
        sender: 'ai',
        text: replyText.trim(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Filter prompts to only show relevant travel suggestions
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
      const errorMsg: Message = {
        sender: 'ai',
        text: '⚠️ There was an error talking to AI. Please try again later.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const aiBackgroundColors = ['#505050', '#606060', '#707070'];
    const backgroundColor =
      item.sender === 'ai' ? aiBackgroundColors[index % aiBackgroundColors.length] : '#1e1e1e';

    return (
      <View
        style={[
          styles.message,
          item.sender === 'user'
            ? styles.userMessage
            : { ...styles.aiMessage },
        ]}
      >
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
          <PromptSelector
            onPromptSend={handleSend}
            overridePrompts={dynamicPrompts}
          />

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={{ padding: 10 }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />

          {loading && (
            <View style={[styles.message, styles.aiMessage]}>
              <Text style={styles.messageText}>AI is typing...</Text>
            </View>
          )}
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
