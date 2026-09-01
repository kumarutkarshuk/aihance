import * as Clipboard from "expo-clipboard";
import { File as ExpoFile, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

export type SaveImageResult = "saved" | "permission-denied";

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

async function downloadReferenceImage(imageUrl: string, postId: string) {
  const destination = new ExpoFile(
    Paths.cache,
    fileNameFromImageUrl(imageUrl, postId),
  );
  return ExpoFile.downloadFileAsync(imageUrl, destination, {
    idempotent: true,
  });
}

export async function copyPrompt(prompt: string): Promise<void> {
  await Clipboard.setStringAsync(prompt);
}

export async function saveReferenceImage(
  imageUrl: string,
  postId: string,
): Promise<SaveImageResult> {
  const permission = await MediaLibrary.requestPermissionsAsync(true);
  if (!permission.granted) {
    return "permission-denied";
  }

  const downloaded = await downloadReferenceImage(imageUrl, postId);
  await MediaLibrary.saveToLibraryAsync(downloaded.uri);
  return "saved";
}
