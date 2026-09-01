import * as Clipboard from "expo-clipboard";
import { File, Paths } from "expo-file-system";
import * as Linking from "expo-linking";
import * as MediaLibrary from "expo-media-library";

export type SaveImageResult = "saved" | "permission-denied";

export async function copyPrompt(prompt: string): Promise<void> {
  await Clipboard.setStringAsync(prompt);
}

function fileNameFromImageUrl(imageUrl: string, postId: string): string {
  try {
    const lastSegment = new URL(imageUrl).pathname.split("/").pop();
    if (lastSegment && lastSegment.includes(".")) {
      return decodeURIComponent(lastSegment);
    }
  } catch {
    // Fall through to a Post-id based name.
  }

  return `${postId}.jpg`;
}

export async function saveReferenceImage(
  imageUrl: string,
  postId: string,
): Promise<SaveImageResult> {
  const permission = await MediaLibrary.requestPermissionsAsync(true);
  if (!permission.granted) {
    return "permission-denied";
  }

  const destination = new File(
    Paths.cache,
    fileNameFromImageUrl(imageUrl, postId),
  );
  const downloaded = await File.downloadFileAsync(imageUrl, destination, {
    idempotent: true,
  });
  await MediaLibrary.saveToLibraryAsync(downloaded.uri);
  return "saved";
}

function chatGptHandoffUrl(prompt: string | null): string {
  if (prompt && prompt.trim().length > 0) {
    return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
  }

  return "https://chatgpt.com/";
}

export async function openChatGPT(prompt: string | null): Promise<void> {
  await Linking.openURL(chatGptHandoffUrl(prompt));
}
