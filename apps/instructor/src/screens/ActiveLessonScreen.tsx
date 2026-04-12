import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import socketio from "socket.io-client";

// @ts-ignore
const io = (socketio.default || socketio) as any;

const COLORS = {
  primary: "#0F172A",
  secondary: "#2DD4BF",
  surface: "#F7F9FB",
  text: "#0F172A",
  textSecondary: "#64748B",
  danger: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
};

export default function ActiveLessonScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [faults, setFaults] = useState<any[]>([]);
  const [location, setLocation] = useState<any>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const handleFault = async (severity: "minor" | "serious" | "dangerous") => {
    await Haptics.notificationAsync(
      severity === "dangerous"
        ? Haptics.NotificationFeedbackType.Error
        : Haptics.NotificationFeedbackType.Warning
    );

    const newFault = {
      severity,
      timestamp: new Date().toISOString(),
      location: location?.coords,
    };

    setFaults([newFault, ...faults]);
    console.log("Fault recorded:", newFault);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Lesson</Text>
        <Text style={styles.headerSubtitle}>Jan Novak • Course B</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.faultButtons}>
          <TouchableOpacity
            style={[styles.faultButton, { backgroundColor: COLORS.danger }]}
            onPress={() => handleFault("dangerous")}
          >
            <Text style={styles.faultButtonText}>DANGEROUS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.faultButton, { backgroundColor: COLORS.warning }]}
            onPress={() => handleFault("serious")}
          >
            <Text style={styles.faultButtonText}>SERIOUS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.faultButton, { backgroundColor: "#FBBF24" }]}
            onPress={() => handleFault("minor")}
          >
            <Text style={styles.faultButtonText}>MINOR</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logSection}>
          <Text style={styles.sectionTitle}>Lesson Log</Text>
          {faults.length === 0 ? (
            <Text style={styles.emptyLog}>No faults recorded yet.</Text>
          ) : (
            faults.map((f, i) => (
              <View key={i} style={styles.logEntry}>
                <View style={[styles.severityDot, { backgroundColor: f.severity === 'dangerous' ? COLORS.danger : (f.severity === 'serious' ? COLORS.warning : '#FBBF24') }]} />
                <View>
                   <Text style={styles.logText}>{f.severity.toUpperCase()} Fault</Text>
                   <Text style={styles.logTime}>{new Date(f.timestamp).toLocaleTimeString()}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.finishButton}
          onPress={() => Alert.alert("Lesson Finished", "Data synced to cloud.")}
        >
          <Text style={styles.finishButtonText}>FINISH LESSON</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { padding: 24, backgroundColor: COLORS.primary },
  headerTitle: { color: "white", fontSize: 24, fontWeight: "900", textTransform: "uppercase" },
  headerSubtitle: { color: COLORS.secondary, fontSize: 14, fontWeight: "bold", marginTop: 4 },
  content: { padding: 24 },
  faultButtons: { gap: 16, marginBottom: 32 },
  faultButton: { padding: 32, borderRadius: 24, alignItems: "center" },
  faultButtonText: { color: "white", fontSize: 20, fontWeight: "900" },
  logSection: { flex: 1 },
  sectionTitle: { fontSize: 12, fontWeight: "900", color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  emptyLog: { color: COLORS.textSecondary, fontSize: 16, fontStyle: "italic", textAlign: "center", marginTop: 24 },
  logEntry: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: "white", padding: 16, borderRadius: 16, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: "#E2E8F0" },
  severityDot: { width: 12, height: 12, borderRadius: 6 },
  logText: { fontWeight: "bold", color: COLORS.text },
  logTime: { fontSize: 10, color: COLORS.textSecondary },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: "#E2E8F0" },
  finishButton: { backgroundColor: COLORS.primary, padding: 20, borderRadius: 16, alignItems: "center" },
  finishButtonText: { color: "white", fontWeight: "900", fontSize: 16 },
});
