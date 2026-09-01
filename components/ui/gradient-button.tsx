import { LinearGradient } from "expo-linear-gradient";
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, fonts, gradients, radii } from "@/lib/theme";

interface GradientButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function GradientButton({
  label,
  onPress,
  disabled = false,
  style,
  accessibilityLabel,
}: GradientButtonProps) {
  const content = (
    <LinearGradient
      colors={[...gradients.selectedPill]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.gradient, style]}
    >
      <Text style={styles.label}>{label}</Text>
    </LinearGradient>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: radii.button,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.foreground,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
