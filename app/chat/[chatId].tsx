import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthProvider';

// Adjust path relative to your project structure
import { Colors, Fonts, Spacing, Radius, Shadow } from '../global';

type Message = {
  id: string;
  sender_id: string;
  content: string;
  status: string;
  created_at: string;
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;  // Use the environment variable for API URL

export default function ChatDetailScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  const chatTitle = name || `User #${id}`;

  const loadMessages = async () => {
    try {
      const res = await fetch(`${BASE_URL}/conversations/${id}/messages`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [id, token])
  );

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;

    setInputText('');

    try {
      const res = await fetch(`${BASE_URL}/conversations/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content: text })
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const deleteMessage = async (messageId: string, scope: 'me' | 'everyone') => {
    try {
      const res = await fetch(`${BASE_URL}/messages/${messageId}?scope=${scope}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      } else {
        Alert.alert("Error", data.message || "Failed to delete message");
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleDeleteMessage = (message: Message) => {
    const isMine = message.sender_id === user?.id;

    const options: any[] = [
      {
        text: "Delete for me",
        style: "destructive",
        onPress: () => deleteMessage(message.id, 'me'),
      },
    ];

    if (isMine) {
      options.push({
        text: "Delete for everyone",
        style: "destructive",
        onPress: () => deleteMessage(message.id, 'everyone'),
      });
    }

    options.push({ text: "Cancel", style: "cancel" });

    Alert.alert("Delete message?", undefined, options);
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderBubble = ({ item }: { item: Message }) => {
    const isSender = item.sender_id === user?.id;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => handleDeleteMessage(item)}
        style={[
          styles.bubbleWrapper,
          isSender ? styles.senderWrapper : styles.receiverWrapper,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isSender ? styles.senderBubble : styles.receiverBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isSender ? Colors.bubbleSentText : Colors.bubbleReceivedText },
            ]}
          >
            {item.content}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.timestampText}>{formatTime(item.created_at)}</Text>
            {isSender && (
              <Ionicons name="checkmark-done" size={16} color={Colors.readTick} style={styles.tickIcon} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Chat Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.textOnPrimary} />
          </TouchableOpacity>

          <View style={styles.headerAvatar}>
            <Text style={styles.avatarText}>{chatTitle.charAt(0).toUpperCase()}</Text>
          </View>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>{chatTitle}</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {/* Chat Messages */}
          <FlatList
            data={[...messages].reverse()}
            keyExtractor={(item) => item.id}
            renderItem={renderBubble}
            inverted
            contentContainerStyle={styles.messagesList}
          />

          {/* Input Bar */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type a message"
                placeholderTextColor={Colors.placeholder}
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
            </View>
            <TouchableOpacity
              style={styles.sendButton}
              activeOpacity={0.8}
              onPress={handleSend}
            >
              <Ionicons name="send" size={18} color={Colors.textOnPrimary} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.headerBackground,
  },
  header: {
    height: 56,
    backgroundColor: Colors.headerBackground,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
    marginRight: Spacing.sm,
  },
  avatarText: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
    fontSize: Fonts.size.base,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: Colors.textOnPrimary,
    fontSize: Fonts.size.base,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: Colors.textOnPrimary,
    fontSize: Fonts.size.xs,
    opacity: 0.8,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  bubbleWrapper: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  senderWrapper: {
    justifyContent: 'flex-end',
  },
  receiverWrapper: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderRadius: Radius.md,
    ...Shadow.small,
  },
  senderBubble: {
    backgroundColor: Colors.bubbleSent,
    borderTopRightRadius: 2,
  },
  receiverBubble: {
    backgroundColor: Colors.bubbleReceived,
    borderTopLeftRadius: 2,
  },
  messageText: {
    fontSize: Fonts.size.base,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  timestampText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  tickIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs + 4,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: Colors.screenBackground,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.xs + 2 : 0,
    marginRight: Spacing.xs + 4,
    maxHeight: 100,
  },
  input: {
    fontSize: Fonts.size.base,
    color: Colors.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
});