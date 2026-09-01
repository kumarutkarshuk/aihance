import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const REPORTER_ID_KEY = "aihance-reporter-id";
const REPORTED_POSTS_KEY = "aihance-reported-posts";

export async function getReporterId(): Promise<string> {
  const existing = await AsyncStorage.getItem(REPORTER_ID_KEY);
  if (existing) {
    return existing;
  }

  const reporterId = Crypto.randomUUID();
  await AsyncStorage.setItem(REPORTER_ID_KEY, reporterId);
  return reporterId;
}

export async function hasReportedPost(postId: string): Promise<boolean> {
  const raw = await AsyncStorage.getItem(REPORTED_POSTS_KEY);
  if (!raw) {
    return false;
  }

  try {
    const reported = JSON.parse(raw) as string[];
    return reported.includes(postId);
  } catch {
    return false;
  }
}

export async function markReportedPost(postId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(REPORTED_POSTS_KEY);
  const reported = raw ? ((JSON.parse(raw) as string[]) ?? []) : [];
  if (reported.includes(postId)) {
    return;
  }

  reported.push(postId);
  await AsyncStorage.setItem(REPORTED_POSTS_KEY, JSON.stringify(reported));
}
