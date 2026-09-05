// lib/global.ts or theme/global.ts — adjust path to your structure

export const Colors = {
  // Core brand (WhatsApp-style green)
  primary: '#075E54',        // dark teal-green — headers, top bar
  primaryLight: '#128C7E',   // lighter teal — buttons, active states
  accent: '#25D366',         // bright green — send button, online dot, FAB

  // Chat bubbles
  bubbleSent: '#DCF8C6',     // light green — your messages
  bubbleReceived: '#FFFFFF', // white — their messages
  bubbleSentText: '#000000',
  bubbleReceivedText: '#000000',

  // Backgrounds
  background: '#ECE5DD',     // chat screen background (that classic beige/tan)
  screenBackground: '#FFFFFF', // list screens, forms
  headerBackground: '#075E54',

  // Text
  textPrimary: '#000000',
  textSecondary: '#667781',  // timestamps, last message preview, muted text
  textOnPrimary: '#FFFFFF',  // text on dark/green backgrounds

  // UI elements
  border: '#E0E0E0',
  divider: '#F0F0F0',
  inputBackground: '#F0F0F0',
  placeholder: '#999999',

  // Status
  online: '#25D366',
  offline: '#999999',
  error: '#FF3B30',
  readTick: '#34B7F1',       // the blue double-check color
  sentTick: '#667781',       // grey single/double check before read

  // Misc
  unreadBadge: '#25D366',
  unreadBadgeText: '#FFFFFF',
};

export const Fonts = {
  regular: 'System',    // swap for a custom font family once you add one via expo-font
  medium: 'System',
  bold: 'System',

  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 999,
};

export const Shadow = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
};