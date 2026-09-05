import React, { useEffect } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthProvider";

function RootLayoutNav() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inUserSetup = segments[0] === "user";
    const atRoot = !segments[0];

    if (token) {
      if (inAuthGroup || inUserSetup || atRoot) {
        router.replace("/(tabs)");
      }
    } else {
      if (!inAuthGroup && !inUserSetup && !atRoot) {  // ← add !inUserSetup here
        router.replace("/(auth)/auth");
      }
    }
  }, [token, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="chat" options={{ title: "Chat" }} />
      <Stack.Screen name="user" />
      <Stack.Screen name="new-chat" options={{ title: "New Chat" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}