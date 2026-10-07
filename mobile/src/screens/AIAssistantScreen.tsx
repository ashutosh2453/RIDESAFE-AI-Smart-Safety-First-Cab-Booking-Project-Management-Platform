import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { api } from '../services/api';
import { Colors } from '../theme/colors';

interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  timestamp: string;
}

export const AIAssistantScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'ASSISTANT',
      content:
        '👋 Hello! I am your RideSafe AI Assistant. I can assist with smart booking, passenger safety protocols, 4-digit PIN verification, pickup assistance, and trip planning. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const starterQuestions = [
    'How do I verify my cab before entering?',
    'What should I do if I feel unsafe?',
    'How does the 4-digit Ride PIN work?',
    'How does Visual Pickup Assistance work?',
  ];

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim() || sending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'USER',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const res = await api.post('/ai/chat', { message: textToSend.trim() });
      if (res.data.success) {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'ASSISTANT',
          content: res.data.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ASSISTANT',
        content: 'I could not connect to the RideSafe knowledge engine right now. Please verify your backend server connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header Info */}
      <View style={styles.topInfo}>
        <Text style={styles.badgeText}>INTELLIGENT PASSENGER COMPANION</Text>
        <Text style={styles.titleText}>RideSafe AI Assistant</Text>
      </View>

      {/* Suggested Starter Questions */}
      <View style={styles.startersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.startersScroll}>
          {starterQuestions.map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.starterChip}
              onPress={() => handleSend(q)}
              disabled={sending}
            >
              <Text style={styles.starterChipText}>💡 {q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((m) => {
          const isUser = m.role === 'USER';
          return (
            <View
              key={m.id}
              style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.assistantWrapper]}
            >
              {!isUser && (
                <View style={styles.aiAvatar}>
                  <Text style={{ fontSize: 16 }}>🤖</Text>
                </View>
              )}

              <View
                style={[
                  styles.messageBubble,
                  isUser ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
                  {m.content}
                </Text>
                <Text style={styles.messageTime}>{m.timestamp}</Text>
              </View>
            </View>
          );
        })}

        {sending && (
          <View style={styles.typingContainer}>
            <View style={styles.aiAvatar}>
              <Text style={{ fontSize: 16 }}>🤖</Text>
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.typingText}>RideSafe AI is analyzing...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Box */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask RideSafe AI about safety, rides..."
          placeholderTextColor={Colors.textDim}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
          onPress={() => handleSend()}
          disabled={!input.trim() || sending}
        >
          <Text style={styles.sendButtonText}>➔</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  topInfo: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
  },
  badgeText: {
    color: Colors.cyan,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  titleText: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  startersContainer: {
    paddingVertical: 8,
  },
  startersScroll: {
    paddingHorizontal: 18,
    gap: 8,
  },
  starterChip: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  starterChipText: {
    color: Colors.cyan,
    fontSize: 11,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 18,
    paddingBottom: 20,
    gap: 12,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  assistantWrapper: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.cardHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: Colors.blue,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: Colors.text,
  },
  messageTime: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 8,
  },
  typingText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  inputContainer: {
    backgroundColor: Colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderRadius: 12,
    color: Colors.text,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    color: '#0B132B',
    fontSize: 18,
    fontWeight: '800',
  },
});
