import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { colors, fonts, splash } from "@/lib/theme";

interface BrandedSplashProps {
  onFinish: () => void;
}

export function BrandedSplash({ onFinish }: BrandedSplashProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    const holdMs = splash.durationMs - splash.fadeMs;
    const holdTimer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: splash.fadeMs,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          onFinish();
        }
      });
    }, holdMs);

    return () => clearTimeout(holdTimer);
  }, [onFinish, opacity]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.wordmark}>AIhance</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.foreground,
  },
});
