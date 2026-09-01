import { useState, type ReactNode } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { useFonts } from "expo-font";
import { BrandedSplash } from "@/components/branded-splash";
import { colors } from "@/lib/theme";

SplashScreen.preventAutoHideAsync();

function DarkShell({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {children}
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Pacifico_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return <DarkShell>{null}</DarkShell>;
  }

  if (!appReady) {
    return (
      <DarkShell>
        <BrandedSplash onFinish={() => setAppReady(true)} />
      </DarkShell>
    );
  }

  return (
    <DarkShell>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="post/[id]" />
      </Stack>
    </DarkShell>
  );
}
