import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthProvider';

import { Colors, Fonts, Spacing, Radius } from '../global';

type ChatPreview = {
  conversation_id: string;
  other_user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
};

type SearchedUser = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ChatsScreen() {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [userResults, setUserResults] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadConversations = async () => {
    try {
      const res = await fetch(`${BASE_URL}/conversations`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setChats(data.conversations);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [token])
  );

  // debounced search: hits /users/search only when there's a query, only after the user pauses typing
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setUserResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`${BASE_URL}/users/search?q=${encodeURIComponent(query)}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setUserResults(data.users);
      } catch (error) {
        console.error("User search failed:", error);
      }
    }, 300); // debounce

    return () => clearTimeout(timeout);
  }, [searchQuery, token]);

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const res = await fetch(`${BASE_URL}/conversations/${selectedId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setChats((prev) => prev.filter((c) => c.conversation_id !== selectedId));
      } else {
        Alert.alert("Error", data.message || "Failed to delete chat");
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    } finally {
      setSelectedId(null);
    }
  };

  const startChat = async (user: SearchedUser) => {
    try {
      const res = await fetch(`${BASE_URL}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ otherUserId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        setSearchQuery('');
        router.push({
          pathname: '/chat/[id]' as any,
          params: { id: data.conversation.id, name: user.display_name, otherUserId: user.id },
        });
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  const filteredChats = chats.filter(
    (chat) =>
      chat.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.last_message ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // don't show a user in "new chat" results if you already have a conversation with them
  const existingUserIds = new Set(chats.map((c) => c.other_user_id));
  const newUserResults = userResults.filter((u) => !existingUserIds.has(u.id));

  const getInitials = (name: string) =>
    name.split(' ').map((part) => part[0]).join('').toUpperCase();

  const formatTimestamp = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderChatItem = ({ item }: { item: ChatPreview }) => {
    const isSelected = item.conversation_id === selectedId;
    return (
      <TouchableOpacity
        style={[styles.chatCard, isSelected && styles.chatCardSelected]}
        activeOpacity={0.7}
        onLongPress={() => setSelectedId(item.conversation_id)}
        onPress={() => {
          if (selectedId) {
            setSelectedId(isSelected ? null : item.conversation_id);
          } else {
            router.push({
              pathname: '/chat/[id]' as any,
              params: { id: item.conversation_id, name: item.display_name, otherUserId: item.other_user_id },
            });
          }
        }}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.display_name)}</Text>
          </View>
        </View>

        <View style={styles.chatContent}>
          <View style={styles.topRow}>
            <Text style={styles.nameText} numberOfLines={1}>{item.display_name}</Text>
            <Text style={[styles.timestampText, item.unread_count > 0 && styles.timestampUnread]}>
              {formatTimestamp(item.last_message_at)}
            </Text>
          </View>
          <View style={styles.bottomRow}>
            <Text style={styles.messageText} numberOfLines={1}>
              {item.last_message ?? 'Say hello 👋'}
            </Text>
            {item.unread_count > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unread_count}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderUserResultItem = ({ item }: { item: SearchedUser }) => (
    <TouchableOpacity style={styles.chatCard} activeOpacity={0.7} onPress={() => startChat(item)}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.display_name)}</Text>
        </View>
      </View>
      <View style={styles.chatContent}>
        <Text style={styles.nameText} numberOfLines={1}>{item.display_name}</Text>
        <Text style={styles.messageText} numberOfLines={1}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  const isSearching = searchQuery.trim().length > 0;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          {selectedId ? (
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => setSelectedId(null)}>
                <Ionicons name="close" size={24} color={Colors.textOnPrimary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <Ionicons name="trash" size={22} color={Colors.textOnPrimary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Chats</Text>
            </View>
          )}
        </View>

        <View style={styles.container}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search chats or people..."
              placeholderTextColor={Colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <FlatList
            data={filteredChats}
            keyExtractor={(item) => item.conversation_id}
            renderItem={renderChatItem}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              isSearching && filteredChats.length > 0 ? (
                <Text style={styles.sectionLabel}>Chats</Text>
              ) : null
            }
            ListFooterComponent={
              isSearching && newUserResults.length > 0 ? (
                <View>
                  <Text style={styles.sectionLabel}>New people</Text>
                  {newUserResults.map((user) => (
                    <View key={user.id}>{renderUserResultItem({ item: user })}</View>
                  ))}
                </View>
              ) : null
            }
            ListEmptyComponent={
              !loading && !isSearching ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No conversations yet</Text>
                </View>
              ) : null
            }
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  chatCardSelected: {
    backgroundColor: Colors.primaryLight + '20',
  },
  sectionLabel: {
    fontSize: Fonts.size.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  safeArea: { flex: 1, backgroundColor: Colors.headerBackground },
  header: {
    height: 56,
    backgroundColor: Colors.headerBackground,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  headerTitle: { fontSize: Fonts.size.xl, fontWeight: '700', color: Colors.textOnPrimary },
  container: { flex: 1, backgroundColor: Colors.screenBackground },
  searchContainer: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.screenBackground },
  searchInput: {
    height: 40,
    backgroundColor: Colors.inputBackground,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Fonts.size.sm,
    color: Colors.textPrimary,
  },
  listContent: { paddingBottom: Spacing.md },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.screenBackground,
  },
  avatarContainer: { position: 'relative', marginRight: Spacing.md },
  avatar: {
    width: 50, height: 50, borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: Colors.textOnPrimary, fontSize: Fonts.size.base, fontWeight: '600' },
  chatContent: { flex: 1, justifyContent: 'center' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  nameText: { fontSize: Fonts.size.base, fontWeight: '600', color: Colors.textPrimary, flex: 1, marginRight: Spacing.xs },
  timestampText: { fontSize: Fonts.size.xs, color: Colors.textSecondary },
  timestampUnread: { color: Colors.unreadBadge, fontWeight: '600' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  messageText: { fontSize: Fonts.size.sm, color: Colors.textSecondary, flex: 1, marginRight: Spacing.sm },
  unreadBadge: {
    minWidth: 20, height: 20, borderRadius: Radius.full,
    backgroundColor: Colors.unreadBadge, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6,
  },
  unreadBadgeText: { color: Colors.unreadBadgeText, fontSize: Fonts.size.xs, fontWeight: '700' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.divider, marginLeft: 74 },
  emptyContainer: { padding: Spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: Fonts.size.sm, color: Colors.textSecondary },
});