import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Feed" }} />
      <Stack.Screen name="post/[id]" options={{ title: "Post" }} />
    </Stack>
  );
}
