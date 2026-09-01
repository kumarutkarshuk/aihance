import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { reportPost } from "@/lib/feed-api";
import {
  copyPrompt,
  openChatGPT,
  saveReferenceImage,
} from "@/lib/handoff";

interface PostActionsProps {
  postId: string;
  prompt: string | null;
  imageUrl: string;
}

type Notice = {
  kind: "success" | "error";
  message: string;
};

export function PostActions({ postId, prompt, imageUrl }: PostActionsProps) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const runAction = useCallback(
    async (action: () => Promise<Notice>, fallbackError: string) => {
      if (busy) {
        return;
      }

      setBusy(true);
      setNotice(null);
      try {
        setNotice(await action());
      } catch {
        setNotice({ kind: "error", message: fallbackError });
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
      return { kind: "success", message: "Prompt copied." };
    }, "Could not copy Prompt. Try again.");
  };

  const onSaveImage = () => {
    void runAction(async () => {
      const result = await saveReferenceImage(imageUrl, postId);
      if (result === "permission-denied") {
        return {
          kind: "error",
          message: "Photo access is needed to save the image.",
        };
      }

      return { kind: "success", message: "Image saved to your photos." };
    }, "Could not save the image. Try again.");
  };

  const onOpenChatGPT = () => {
    void runAction(async () => {
      await openChatGPT(prompt);
      return { kind: "success", message: "Opening ChatGPT." };
    }, "Could not open ChatGPT.");
  };

  const onReport = () => {
    void runAction(async () => {
      await reportPost(postId);
      return {
        kind: "success",
        message: "Report submitted. This Post stays in the Feed.",
      };
    }, "Could not submit Report. Try again.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Handoff</Text>
      <Text style={styles.hint}>
        Copy the Prompt, save the image, then Restyle in ChatGPT.
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
        style={[styles.button, busy && styles.buttonDisabled]}
        onPress={onOpenChatGPT}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Open in ChatGPT"
      >
        <Text style={styles.buttonLabel}>Open in ChatGPT</Text>
      </Pressable>

      <Pressable
        style={[styles.reportButton, busy && styles.buttonDisabled]}
        onPress={onReport}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Report this Post"
      >
        <Text style={styles.reportLabel}>Report</Text>
      </Pressable>

      {busy ? <ActivityIndicator /> : null}

      {notice ? (
        <Text
          style={
            notice.kind === "error" ? styles.errorNotice : styles.successNotice
          }
          accessibilityLiveRegion="polite"
        >
          {notice.message}
        </Text>
      ) : null}
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
  successNotice: {
    fontSize: 14,
    color: "#1a7f37",
  },
  errorNotice: {
    fontSize: 14,
    color: "#a33",
  },
});
