import React, { useState, useRef, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthProvider'; // Removed unused AuthProvider import
import { Colors, Fonts, Spacing, Radius, Shadow } from '../global';

const OTP_LENGTH = 6;
const RESEND_TIMEOUT = 30;

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const displayEmail = email || 'your email';

  // 1. Destructure signIn from useAuth Context
  const { signIn } = useAuth();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChangeText = (text: string, index: number) => {
    setError(null);

    if (text.length > 1) {
      const pastedOtp = text.trim().slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);

      const nextFocus = Math.min(pastedOtp.length, OTP_LENGTH - 1);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text !== '' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    try {
      const res = await fetch(`${BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to resend code');
        return;
      }
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimer(RESEND_TIMEOUT);
      setCanResend(false);
      setError(null);
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error(err);
      setError('Could not resend code');
    }
  };

  const handleVerifyOtp = async () => {
    // 2. Combine the array of OTP digits into a single string
    const fullOtp = otp.join('');

    if (fullOtp.length < OTP_LENGTH) {
      setError('Please enter all 6 digits');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: fullOtp }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.exists) {
          // Existing user -> Save session & go to main app
          await signIn(data.token, data.user);
          router.replace('/(tabs)');
        } else {
          // New user -> Send to profile setup screen with email parameter
          router.push({ pathname: '/user', params: { email } });
        }
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Network Error', 'Could not connect to the server');
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
            <View style={styles.topBar}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.headerContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark" size={36} color={Colors.primary} />
              </View>
              <Text style={styles.title}>Verify Email</Text>
              <Text style={styles.subtitle}>
                We sent a 6-digit verification code to{' '}
                <Text style={styles.emailHighlight}>{displayEmail}</Text>
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.otpRow}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpBox,
                      digit !== '' && styles.otpBoxFilled,
                      error ? styles.otpBoxError : null,
                    ]}
                    value={digit}
                    onChangeText={(text) => handleChangeText(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={index === 0 ? OTP_LENGTH : 1}
                    selectTextOnFocus
                    textAlign="center"
                  />
                ))}
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* 3. Button correctly references handleVerifyOtp */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleVerifyOtp}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Verify & Continue</Text>
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive code? </Text>
                <TouchableOpacity
                  onPress={handleResendCode}
                  disabled={!canResend}
                >
                  <Text
                    style={[
                      styles.resendLink,
                      !canResend && styles.resendDisabled,
                    ]}
                  >
                    {canResend ? 'Resend Code' : `Resend in ${timer}s`}
                  </Text>
                </TouchableOpacity>
              </View>
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
    justifyContent: 'space-between',
  },
  topBar: {
    height: 48,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: Spacing.md,
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
    paddingHorizontal: Spacing.sm,
  },
  emailHighlight: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  formContainer: {
    width: '100%',
    marginVertical: Spacing.xl,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  otpBox: {
    width: 46,
    height: 54,
    borderRadius: Radius.md,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1.5,
    borderColor: Colors.border,
    fontSize: Fonts.size.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  otpBoxFilled: {
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.screenBackground,
  },
  otpBoxError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: Fonts.size.xs,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  button: {
    height: 52,
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadow.small,
  },
  buttonText: {
    color: Colors.textOnPrimary,
    fontSize: Fonts.size.base,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  resendText: {
    fontSize: Fonts.size.sm,
    color: Colors.textSecondary,
  },
  resendLink: {
    fontSize: Fonts.size.sm,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  resendDisabled: {
    color: Colors.placeholder,
    fontWeight: '400',
  },
});