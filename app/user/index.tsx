import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Adjust path relative to your project structure
import { Colors, Fonts, Spacing, Radius, Shadow } from "../global";
import { useAuth } from "../../context/AuthProvider";

export default function UserInfo() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { signIn } = useAuth();

  const { email } = useLocalSearchParams<{ email?: string }>();
  const displayEmail = email || "user@example.com";
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const handleSave = async () => {
    // Add validation or save profile API call here
    try{
      const data = await fetch(`${API_URL}/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: fullName, username, email: displayEmail })
      });
      const res = await data.json();
      if(res.success){
        await signIn(res.token, res.user);
        console.log("User info saved successfully");
        router.replace("/(tabs)");
      }else{
        console.log("Failed to save user info", res.message);
      }

    }catch(error){
      console.error("Error saving user info:", error);
    }
    
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            {/* Header Section */}
            <View style={styles.headerContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-add" size={36} color={Colors.primary} />
              </View>
              <Text style={styles.title}>Complete Profile</Text>
              <Text style={styles.subtitle}>
                Set up your personal details so friends can identify you on the platform.
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formContainer}>
              {/* Full Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === "fullName" && styles.inputFocused,
                  ]}
                  placeholder="e.g. Alex Rivera"
                  placeholderTextColor={Colors.placeholder}
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setFocusedField("fullName")}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="words"
                />
              </View>

              {/* Username Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === "username" && styles.inputFocused,
                  ]}
                  placeholder="e.g. alexrivera"
                  placeholderTextColor={Colors.placeholder}
                  value={username}
                  onChangeText={setUsername}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Read-Only Email Field */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="lock-closed" size={10} color={Colors.textSecondary} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                </View>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={displayEmail}
                  editable={false}
                  selectTextOnFocus={false}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Save & Continue</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 20 }} />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.screenBackground,
  },
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: "space-between",
  },
  headerContainer: {
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.inputBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Fonts.size.xxl,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Fonts.size.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: Spacing.sm,
  },
  formContainer: {
    width: "100%",
    marginVertical: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Fonts.size.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    gap: 4,
  },
  verifiedText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  input: {
    height: 52,
    backgroundColor: Colors.inputBackground,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Fonts.size.base,
    color: Colors.textPrimary,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  inputFocused: {
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.screenBackground,
  },
  inputDisabled: {
    opacity: 0.7,
    color: Colors.textSecondary,
    borderColor: Colors.border,
  },
  button: {
    height: 52,
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.md,
    ...Shadow.small,
  },
  buttonText: {
    color: Colors.textOnPrimary,
    fontSize: Fonts.size.base,
    fontWeight: "600",
  },
});