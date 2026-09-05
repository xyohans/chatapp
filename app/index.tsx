import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from './global'; // adjust path

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Ionicons name="chatbubbles" size={90} color={Colors.textOnPrimary} />
        </View>

        <Text style={styles.title}>Chat App</Text>
        <Text style={styles.description}>
          Simple, fast messaging. Chat with people in real time — see who's online,
          who's typing, and never miss a message.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/auth')}
        >
          <Text style={styles.buttonText}>Start Messaging</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textOnPrimary,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Fonts.size.base,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  buttonText: {
    color: Colors.textOnPrimary,
    fontSize: Fonts.size.base,
    fontWeight: '700',
  },
  link: {
    textAlign: 'center',
    color: '#E0E0E0',
    fontSize: Fonts.size.sm,
  },
  linkBold: {
    color: Colors.textOnPrimary,
    fontWeight: '700',
  },
});