// app/new-chat.tsx
import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthProvider';
import { Colors, Fonts, Spacing, Radius } from './global';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;  // Use the environment variable for API URL

type SearchedUser = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
};

export default function NewChatScreen() {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (text: string) => {
    setQuery(text);
    if (text.trim().length === 0) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/users/search?q=${encodeURIComponent(text)}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setResults(data.users);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
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
        router.replace({
          pathname: '/chat/[id]' as any,
          params: { id: data.conversation.id, name: user.display_name, otherUserId: user.id },
        });
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by username..."
        placeholderTextColor={Colors.placeholder}
        value={query}
        onChangeText={search}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userRow} onPress={() => startChat(item)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.display_name.split(' ').map(p => p[0]).join('').toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.displayName}>{item.display_name}</Text>
              <Text style={styles.username}>@{item.username}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query.length > 0 && !loading ? (
            <Text style={styles.emptyText}>No users found</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.screenBackground, padding: Spacing.md },
  searchInput: {
    height: 44,
    backgroundColor: Colors.inputBackground,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Fonts.size.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  avatar: {
    width: 44, height: 44, borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: { color: Colors.textOnPrimary, fontWeight: '600' },
  displayName: { fontSize: Fonts.size.base, fontWeight: '600', color: Colors.textPrimary },
  username: { fontSize: Fonts.size.sm, color: Colors.textSecondary },
  emptyText: { textAlign: 'center', marginTop: Spacing.xl, color: Colors.textSecondary },
});