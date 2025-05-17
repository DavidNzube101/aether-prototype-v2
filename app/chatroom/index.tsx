"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"

// Mock chat messages
const MOCK_MESSAGES = [
  {
    id: 1,
    sender: "John Doe",
    avatar: require("../../assets/images/challenges/steps-challenge.png"),
    message: "Hey everyone! How's the challenge going?",
    timestamp: "10:30 AM",
    isCurrentUser: false,
  },
  {
    id: 2,
    sender: "You",
    avatar: require("../../assets/images/challenges/steps-challenge.png"),
    message: "Going great! Already at 5,000 steps today.",
    timestamp: "10:32 AM",
    isCurrentUser: true,
  },
  {
    id: 3,
    sender: "Sarah Johnson",
    avatar: require("../../assets/images/challenges/steps-challenge.png"),
    message: "I'm at 7,500 steps. Trying to reach 10K by evening!",
    timestamp: "10:35 AM",
    isCurrentUser: false,
  },
  {
    id: 4,
    sender: "Mike Williams",
    avatar: require("../../assets/images/challenges/steps-challenge.png"),
    message: "Any tips for getting more steps in during work hours?",
    timestamp: "10:40 AM",
    isCurrentUser: false,
  },
  {
    id: 5,
    sender: "You",
    avatar: require("../../assets/images/challenges/steps-challenge.png"),
    message: "I take a short walk every hour and use stairs instead of elevator!",
    timestamp: "10:42 AM",
    isCurrentUser: true,
  },
]

export default function ChatroomScreen() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const params = useLocalSearchParams()
  const router = useRouter()

  const challengeId = params.challengeId as string

  const sendMessage = () => {
    if (!message.trim()) return

    const newMessage = {
      id: messages.length + 1,
      sender: "You",
      avatar: require("../../assets/images/challenges/steps-challenge.png"),
      message: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isCurrentUser: true,
    }

    setMessages([...messages, newMessage])
    setMessage("")
  }

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
      {!item.isCurrentUser && <Image source={item.avatar} style={styles.avatar} />}

      <View style={[styles.messageBubble, item.isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
        {!item.isCurrentUser && <Text style={styles.senderName}>{item.sender}</Text>}
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>

      {item.isCurrentUser && <Image source={item.avatar} style={styles.avatar} />}
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge Chatroom</Text>
        <Text style={styles.headerSubtitle}>Challenge #{challengeId}</Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesContainer}
        inverted={false}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#777777"
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!message.trim()}
        >
          <Ionicons name="send" size={20} color={message.trim() ? "#FFFFFF" : "#666666"} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    backgroundColor: "#111111",
    padding: 15,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#CCCCCC",
  },
  messagesContainer: {
    padding: 15,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-end",
  },
  currentUserMessage: {
    justifyContent: "flex-end",
  },
  otherUserMessage: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 12,
    borderRadius: 16,
  },
  currentUserBubble: {
    backgroundColor: "#333333",
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: "#222222",
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  timestamp: {
    fontSize: 10,
    color: "#CCCCCC",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#111111",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#222222",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: "#FFFFFF",
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: "#222222",
  },
})
