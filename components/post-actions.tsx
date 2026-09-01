import { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { GradientButton } from "@/components/ui/gradient-button";
import { PlainBorderButton } from "@/components/ui/plain-border-button";
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
        <GradientButton
          label="Copy Prompt"
          onPress={onCopyPrompt}
          disabled={busy}
          accessibilityLabel="Copy Prompt"
        />
      ) : null}

      {imageUrl ? (
        <GradientButton
          label="Save image"
          onPress={onSaveImage}
          disabled={busy}
          accessibilityLabel="Save image"
        />
      ) : null}

      <PlainBorderButton
        label={reported ? "Reported" : "Report"}
        onPress={onReport}
        disabled={busy || reported}
        destructive
        reported={reported}
        accessibilityLabel={
          reported ? "Post already reported" : "Report this Post"
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
});
