import Constants from "expo-constants";
import { Platform } from "react-native";

const API_PORT = 8787;

function getExpoDevHost(): string | null {
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    Constants.expoConfig?.hostUri?.split(":")[0];

  if (!debuggerHost) {
    return null;
  }

  return debuggerHost.split(":")[0] ?? null;
}

function getDefaultFeedApiUrl(): string {
  const expoDevHost = getExpoDevHost();

  // Android emulator: localhost is the emulator itself; 10.0.2.2 is the host Mac.
  if (Platform.OS === "android" && !Constants.isDevice) {
    return `http://10.0.2.2:${API_PORT}`;
  }

  // Physical device or iOS simulator: use the dev machine IP from Expo.
  if (expoDevHost) {
    return `http://${expoDevHost}:${API_PORT}`;
  }

  return Platform.OS === "android"
    ? `http://10.0.2.2:${API_PORT}`
    : `http://localhost:${API_PORT}`;
}

export function getFeedApiUrl(): string {
  return process.env.EXPO_PUBLIC_FEED_API_URL ?? getDefaultFeedApiUrl();
}
