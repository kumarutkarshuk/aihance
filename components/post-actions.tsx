import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { reportPost } from "@/lib/feed-api";
import { copyPrompt, saveReferenceImage } from "@/lib/handoff";

interface PostActionsProps {
  postId: string;
  prompt: string | null;
  imageUrl: string;
}

export function PostActions({ postId, prompt, imageUrl }: PostActionsProps) {
  const [busy, setBusy] = useState(false);

  const runAction = useCallback(
    async (action: () => Promise<string | void>, fallbackError: string) => {
      if (busy) {
        return;
      }

      setBusy(true);
      try {
        const successTitle = await action();
        if (successTitle) {
          Alert.alert(successTitle);
        }
      } catch {
        Alert.alert(fallbackError);
      } finally {
        setBusy(false);
      }
    },
    [busy],
  );

  const onCopyPrompt = () => {
    if (!prompt) {
      return;
    }

    void runAction(async () => {
      await copyPrompt(prompt);
      return "Copied";
    }, "Could not copy Prompt. Try again.");
  };

  const onSaveImage = () => {
    void runAction(async () => {
      const result = await saveReferenceImage(imageUrl, postId);
      if (result === "permission-denied") {
        Alert.alert("Allow photo access to save this image.");
        return;
      }

      return "Saved";
    }, "Could not save the image. Try again.");
  };

  const onReport = () => {
    void runAction(async () => {
      await reportPost(postId);
      return "Report sent";
    }, "Could not send Report. Try again.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Handoff</Text>
      <Text style={styles.hint}>
        Copy the Prompt and save the image, then Restyle in ChatGPT.
      </Text>

      {prompt ? (
        <Pressable
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={onCopyPrompt}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Copy Prompt"
        >
          <Text style={styles.buttonLabel}>Copy Prompt</Text>
        </Pressable>
      ) : null}

      {imageUrl ? (
        <Pressable
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={onSaveImage}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Save image"
        >
          <Text style={styles.buttonLabel}>Save image</Text>
        </Pressable>
      ) : null}

      <Pressable
        style={[styles.reportButton, busy && styles.buttonDisabled]}
        onPress={onReport}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Report this Post"
      >
        <Text style={styles.reportLabel}>Report</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  hint: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  reportButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  reportLabel: {
    color: "#a33",
    fontSize: 16,
    fontWeight: "600",
  },
});
