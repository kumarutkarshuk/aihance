import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { reportPost } from "@/lib/feed-api";
import { copyPrompt, saveReferenceImage } from "@/lib/handoff";
import {
  getReporterId,
  hasReportedPost,
  markReportedPost,
} from "@/lib/reporting";

interface PostActionsProps {
  postId: string;
  prompt: string | null;
  imageUrl: string;
}

export function PostActions({ postId, prompt, imageUrl }: PostActionsProps) {
  const [busy, setBusy] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    void hasReportedPost(postId).then(setReported);
  }, [postId]);

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
    if (reported) {
      return;
    }

    void runAction(async () => {
      const reporterId = await getReporterId();
      const result = await reportPost(postId, reporterId);
      await markReportedPost(postId);
      setReported(true);
      return result.alreadyReported ? "Already reported" : "Report sent";
    }, "Could not send Report. Try again.");
  };

  return (
    <View style={styles.container}>
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
        style={[
          styles.reportButton,
          (busy || reported) && styles.buttonDisabled,
          reported && styles.reportedButton,
        ]}
        onPress={onReport}
        disabled={busy || reported}
        accessibilityRole="button"
        accessibilityLabel={reported ? "Post already reported" : "Report this Post"}
      >
        <Text style={[styles.reportLabel, reported && styles.reportedLabel]}>
          {reported ? "Reported" : "Report"}
        </Text>
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
  reportedButton: {
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
  },
  reportedLabel: {
    color: "#888",
  },
});
