import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, fonts, radii } from "@/lib/theme";

interface PlainBorderButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  reported?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function PlainBorderButton({
  label,
  onPress,
  disabled = false,
  destructive = false,
  reported = false,
  style,
  accessibilityLabel,
}: PlainBorderButtonProps) {
  const content = (
    <View style={[styles.button, reported && styles.reportedButton, style]}>
      <Text
        style={[
          styles.label,
          destructive && styles.destructiveLabel,
          disabled && styles.disabledLabel,
        ]}
      >
        {label}
      </Text>
    </View>
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
  button: {
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
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
  destructiveLabel: {
    color: colors.destructive,
  },
  reportedButton: {
    borderColor: colors.glassBorder,
  },
  disabledLabel: {
    color: colors.destructiveMuted,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
