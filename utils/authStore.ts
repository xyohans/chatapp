import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'user_token';
const USER_KEY = 'user_data';

export async function saveSession(token: string, user: any) {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

export async function getSession() {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const userJson = await AsyncStorage.getItem(USER_KEY);
    return {
      token,
      user: userJson ? JSON.parse(userJson) : null,
    };
  } catch (error) {
    console.error('Failed to read session:', error);
    return { token: null, user: null };
  }
}

export async function clearSession() {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}