import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";
import ActiveLessonScreen from "./src/screens/ActiveLessonScreen";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <ActiveLessonScreen />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
