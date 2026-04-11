import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";

const FAULT_CATEGORIES = [
  "Observation",
  "Vehicle Control",
  "Speed Management",
  "Awareness",
  "Signage",
];

// Kinetic Precision Colors
const COLORS = {
  primary: "#0F172A", // Deep Navy
  secondary: "#2DD4BF", // Electric Teal
  surface: "#F7F9FB",
  dangerous: "#EF4444", // Red
  serious: "#F59E0B", // Orange/Amber
  minor: "#2DD4BF", // Teal
  textMain: "#191C1E",
  textVariant: "#45464D",
  white: "#FFFFFF",
};

const MOCK_LESSON_ID = "lesson-123";
const MOCK_SCHOOL_ID = "school-456";
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8080";
const TELEMETRY_STORAGE_KEY = "@current_lesson_telemetry";
const SYNC_QUEUE_KEY = "@sync_queue";

const socket = io(API_URL);
const BACKGROUND_LOCATION_TASK = "BACKGROUND_LOCATION_TASK";

TaskManager.defineTask(
  BACKGROUND_LOCATION_TASK,
  async ({ data, error }: any) => {
    if (error) {
      console.error("Background location error:", error);
      return;
    }
    if (data) {
      const { locations } = data;
      try {
        const stored = await AsyncStorage.getItem(TELEMETRY_STORAGE_KEY);
        const telemetry = stored ? JSON.parse(stored) : [];
        const newPoints = locations.map((loc: any) => ({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          timestamp: new Date(loc.timestamp).toISOString(),
        }));

        // Zero-movement filtering: Only add if changed or time gap > 30s
        const lastPoint = telemetry[telemetry.length - 1];
        const filteredNewPoints = newPoints.filter((p: any) => {
           if (!lastPoint) return true;
           const dist = Math.sqrt(Math.pow(p.lat - lastPoint.lat, 2) + Math.pow(p.lng - lastPoint.lng, 2));
           return dist > 0.00001; // Approx 1 meter
        });

        if (filteredNewPoints.length > 0) {
            await AsyncStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify([...telemetry, ...filteredNewPoints]));
        }
      } catch (err) {
        console.error("Failed to store background telemetry:", err);
      }
    }
  }
);

export function ActiveLessonScreen() {
  const [selectedCategory, setSelectedCategory] = useState(FAULT_CATEGORIES[0]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isLessonActive, setIsLessonActive] = useState(false);
  const [currentFaults, setCurrentFaults] = useState<any[]>([]);

  useEffect(() => {
    socket.on("connect", () => {
      setIsSocketConnected(true);
      socket.emit("join_school", MOCK_SCHOOL_ID);
      // Auto-retry queue when connection restored
      processSyncQueue();
    });

    socket.on("disconnect", () => {
      setIsSocketConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const processSyncQueue = async () => {
    try {
      const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (!queueJson) return;

      const queue = JSON.parse(queueJson);
      if (queue.length === 0) return;

      console.log(`Retrying sync for ${queue.length} items...`);

      const remaining = [];
      for (const item of queue) {
        try {
          const response = await fetch(`${API_URL}/lessons/${item.lessonId}/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.data),
          });
          if (!response.ok) remaining.push(item);
        } catch (e) {
          remaining.push(item);
        }
      }

      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));
      if (remaining.length === 0) {
          Alert.alert("Sync Complete", "All pending lesson data has been uploaded.");
      }
    } catch (err) {
      console.error("Error processing sync queue:", err);
    }
  };

  const startLesson = async () => {
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();

    if (fgStatus !== "granted" || bgStatus !== "granted") {
      Alert.alert("Permission Denied", "Location permissions are required for tracking.");
      return;
    }

    await AsyncStorage.removeItem(TELEMETRY_STORAGE_KEY);
    setCurrentFaults([]);

    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 5,
      foregroundService: {
        notificationTitle: "DrivePro Active Tracking",
        notificationBody: "Recording lesson telemetry...",
        notificationColor: COLORS.secondary,
      },
    });

    setIsLessonActive(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const endLesson = async () => {
    setIsLessonActive(false);
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);

    const telemetryJson = await AsyncStorage.getItem(TELEMETRY_STORAGE_KEY);
    const telemetry = telemetryJson ? JSON.parse(telemetryJson) : [];

    const syncData = {
      coordinates: telemetry,
      faults: currentFaults,
    };

    try {
      const response = await fetch(`${API_URL}/lessons/${MOCK_LESSON_ID}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(syncData),
      });

      if (response.ok) {
        Alert.alert("Success", "Lesson data synced successfully");
        await AsyncStorage.removeItem(TELEMETRY_STORAGE_KEY);
      } else {
        throw new Error("Server error");
      }
    } catch (error) {
      console.log("Offline or sync failed, queueing...");
      const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      const queue = queueJson ? JSON.parse(queueJson) : [];
      queue.push({ lessonId: MOCK_LESSON_ID, data: syncData, timestamp: new Date().toISOString() });
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));

      Alert.alert("Offline Mode", "Sync failed. Data stored locally and will retry when connection is restored.");
    }
  };

  const handleFaultTap = async (severity: "minor" | "serious" | "dangerous") => {
    if (!isLessonActive) return;

    if (severity === "dangerous") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else if (severity === "serious") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

    const faultPin = {
      type: selectedCategory,
      severity,
      timestamp: new Date().toISOString(),
      coordinate: {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      },
    };

    setCurrentFaults(prev => [...prev, faultPin]);

    if (isSocketConnected) {
      socket.emit("lesson_update", {
        lessonId: MOCK_LESSON_ID,
        faultPins: [faultPin],
        coordinates: faultPin.coordinate,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{isLessonActive ? "RECORDING" : "ACTIVE LESSON"}</Text>
          <Text style={styles.subtitle}>SESSION #L-12345</Text>
        </View>

        <View style={styles.categorySelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {FAULT_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.hudGrid}>
          <TouchableOpacity style={[styles.hudButton, styles.buttonMinor]} onPress={() => handleFaultTap("minor")}>
            <Text style={styles.hudButtonLabel}>MINOR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.hudButton, styles.buttonSerious]} onPress={() => handleFaultTap("serious")}>
            <Text style={styles.hudButtonLabel}>SERIOUS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.hudButton, styles.buttonDangerous]} onPress={() => handleFaultTap("dangerous")}>
            <Text style={styles.hudButtonLabel}>DANGEROUS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          {!isLessonActive ? (
            <TouchableOpacity style={styles.startButton} onPress={startLesson}>
              <Text style={styles.actionButtonText}>START LESSON</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.endButton} onPress={endLesson}>
              <Text style={styles.actionButtonText}>END & SYNC</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  container: { flex: 1, padding: 24 },
  header: { marginBottom: 20, marginTop: 10 },
  title: { fontSize: 32, fontWeight: "900", color: COLORS.primary, letterSpacing: -1 },
  subtitle: { fontSize: 12, fontWeight: "700", color: COLORS.textVariant, letterSpacing: 1, marginTop: 2 },
  categorySelector: { marginBottom: 24 },
  scrollContent: { paddingRight: 24 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.white, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryText: { fontSize: 11, fontWeight: "800", color: COLORS.textVariant },
  categoryTextActive: { color: COLORS.white },
  hudGrid: { flex: 1, gap: 16, marginBottom: 24 },
  hudButton: { flex: 1, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  buttonMinor: { backgroundColor: COLORS.minor },
  buttonSerious: { backgroundColor: COLORS.serious },
  buttonDangerous: { backgroundColor: COLORS.dangerous },
  hudButtonLabel: { color: COLORS.white, fontSize: 24, fontWeight: "900", letterSpacing: 2 },
  footer: { gap: 16 },
  startButton: { backgroundColor: COLORS.secondary, padding: 20, borderRadius: 20, alignItems: "center" },
  endButton: { backgroundColor: COLORS.primary, padding: 20, borderRadius: 20, alignItems: "center" },
  actionButtonText: { color: COLORS.white, fontSize: 18, fontWeight: "900", letterSpacing: 1 },
});
