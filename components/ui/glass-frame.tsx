import { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radii } from "@/lib/theme";

interface GlassFrameProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GlassFrame({ children, style }: GlassFrameProps) {
  return <View style={[styles.frame, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radii.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: "hidden",
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
});
