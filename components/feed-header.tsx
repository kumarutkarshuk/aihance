import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/lib/theme";

export function FeedHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.wordmark}>AIhance</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: colors.background,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.foreground,
  },
});
