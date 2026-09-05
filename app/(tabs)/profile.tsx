import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthProvider';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../global';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

type UserProfile = {
  id: string;
  display_name: string;
  username: string;
  email: string;
};

export default function ProfileScreen() {
  const { token, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const loadProfile = async () => {
    try {
      const res = await fetch(`${BASE_URL}/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setProfile(data.user);
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [token])
  );

  const getInitials = (name: string) =>
    name.split(' ').map((part) => part[0]).join('').toUpperCase();

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/auth');
  };

  if (!profile) return null; // or a loading spinner

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(profile.display_name)}</Text>
              </View>
            </View>
            <Text style={styles.displayName}>{profile.display_name}</Text>
            <Text style={styles.displayUsername}>@{profile.username}</Text>
          </View>

          <View style={styles.infoGroup}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}><Text style={styles.infoIcon}>👤</Text></View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{profile.display_name}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}><Text style={styles.infoIcon}>🏷️</Text></View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Username</Text>
                <Text style={styles.infoValue}>@{profile.username}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}><Text style={styles.infoIcon}>✉️</Text></View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile.email}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}



const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.screenBackground,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.screenBackground,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.screenBackground,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.small,
  },
  avatarText: {
    color: Colors.textOnPrimary,
    fontSize: 36,
    fontWeight: '600',
  },
  displayName: {
    fontSize: Fonts.size.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  displayUsername: {
    fontSize: Fonts.size.sm,
    color: Colors.textSecondary,
  },
  infoGroup: {
    backgroundColor: Colors.screenBackground,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  infoIconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: Fonts.size.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: Fonts.size.base,
    color: Colors.textPrimary,
    fontWeight: '400',
  },
  infoSubtext: {
    fontSize: Fonts.size.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginLeft: 68,
  },
  logoutButton: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.inputBackground,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: Colors.error,
    fontSize: Fonts.size.base,
    fontWeight: '600',
  },
});