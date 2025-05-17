import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { fetchBotResponse } from '../../services/maxfit-service';
import { Ionicons } from "@expo/vector-icons";

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hi! I'm MaxFit, your fitness assistant. How can I help?", isUser: false }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [errorState, setErrorState] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim() || errorState) return;

    // Reset error state on new message
    setErrorState(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const botResponse = await fetchBotResponse(inputText);

      const botMessage: Message = {
        id: Date.now().toString(),
        text: botResponse,
        isUser: false,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
        console.error('Error:', error);
        setErrorState(true);
        setMessages((prev) => [
          ...prev,
          {
            id: 'error-' + Date.now(),
            text: error.message?.includes('Failed to get fitness advice') 
              ? error.message 
              : "Sorry, I'm having trouble connecting right now.",
            isUser: false,
          },
        ]);
      }

    setIsLoading(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.wrapper}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={item.isUser ? styles.userBubble : styles.botBubble}>
            <Text style={item.isUser ? styles.userText : styles.botText}>
              {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          onSubmitEditing={handleSend}
          editable={!isLoading}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={isLoading}
        >
          <Ionicons name="send-outline" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'space-between', // Add this to keep input at the bottom
    },
  messageList: {
    padding: 16,
    paddingBottom: 80,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#1f1f1f',
    borderRadius: 15,
    padding: 12,
    marginVertical: 4,
    maxWidth: '80%',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12,
    marginVertical: 4,
    maxWidth: '80%',
  },
  userText: {
    color: 'white',
  },
  botText: {
    color: 'black',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    color: 'black',
  },
  sendButton: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatInterface;
