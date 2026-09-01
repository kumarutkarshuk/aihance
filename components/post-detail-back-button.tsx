import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/lib/theme";

interface PostDetailBackButtonProps {
  onPress: () => void;
}

export function PostDetailBackButton({ onPress }: PostDetailBackButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Back to Feed"
      style={({ pressed }) => [
        styles.button,
        {
          top: insets.top + 12,
          left: insets.left + 12,
        },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name="chevron-back" size={22} color={colors.foreground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    zIndex: 100,
    elevation: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
});
