import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';

import { Colors, Fonts, Spacing, Radius, Shadow } from '../global';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const handleSendOtp = async () => {
    if (loading) return; // extra guard against rapid double-taps

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const res = await response.json();

      if (res.success) {
        router.push({
          pathname: '/verify',
          params: { email: trimmedEmail },
        });
      } else {
        setError(res.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.log('Network error:', error);
      setError('Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <View style={styles.headerContainer}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>✉️</Text>
              </View>
              <Text style={styles.title}>Welcome to Chat</Text>
              <Text style={styles.subtitle}>
                Enter your email address to receive a one-time verification code.
              </Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, isFocused && styles.inputFocused]}
                placeholder="name@example.com"
                placeholderTextColor={Colors.placeholder}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOtp}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.textOnPrimary} />
                ) : (
                  <Text style={styles.buttonText}>Send OTP Code</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ...all your existing styles unchanged, plus add:
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: Colors.error,
    fontSize: Fonts.size.xs,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    justifyContent: 'space-between',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: Fonts.size.xxl,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Fonts.size.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },
  formContainer: {
    width: '100%',
    marginVertical: Spacing.xl,
  },
  label: {
    fontSize: Fonts.size.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  input: {
    height: 52,
    backgroundColor: Colors.inputBackground,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Fonts.size.base,
    color: Colors.textPrimary,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginBottom: Spacing.lg,
  },
  inputFocused: {
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.screenBackground,
  },
  button: {
    height: 52,
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.small,
  },
  buttonText: {
    color: Colors.textOnPrimary,
    fontSize: Fonts.size.base,
    fontWeight: '600',
  },
  footerText: {
    fontSize: Fonts.size.xs,
    color: Colors.placeholder,
    textAlign: 'center',
    lineHeight: 16,
  },
});