import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';

const COLORS = {
  primary: '#0F172A',
  secondary: '#2DD4BF',
  surface: '#F7F9FB',
  white: '#FFFFFF',
  textVariant: '#64748B',
  major: '#EF4444',
};

const FAULT_CATEGORIES = [
  'Observation',
  'Signalling',
  'Speed',
  'Positioning',
  'Control',
  'Judgment',
];

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080';
const MOCK_LESSON_ID = 'lesson-123';
const MOCK_SCHOOL_ID = 'school-456';
const FAULT_QUEUE_KEY = '@fault_queue';

const socket = io(API_URL);

TaskManager.defineTask('BACKGROUND_LOCATION_TASK', async ({ data, error }: any) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data;
    const location = locations[0];
    if (location) {
      try {
        await fetch(`${API_URL}/lessons/${MOCK_LESSON_ID}/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            school_id: MOCK_SCHOOL_ID,
            coordinates: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
          }),
        });
      } catch (e) {
        // Silently fail in background
      }
    }
  }
});

export function ActiveLessonScreen() {
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(FAULT_CATEGORIES[0]);
  const [isVehicleModalVisible, setIsVehicleModalVisible] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const MOCK_VEHICLES = [
    { id: 'veh-1', name: 'Skoda Octavia (1AB 1234)' },
    { id: 'veh-2', name: 'VW Golf (2CD 5678)' },
  ];

  useEffect(() => {
    socket.on('connect', () => {
      setIsSocketConnected(true);
      syncOfflineFaults();
    });

    socket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Foreground location permission is required');
        return;
      }

      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus !== 'granted') {
        console.warn('Background location permission denied');
      }

      setHasLocationPermission(true);

      // Start background location updates
      await Location.startLocationUpdatesAsync('BACKGROUND_LOCATION_TASK', {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
        distanceInterval: 5,
        foregroundService: {
          notificationTitle: "DrivePro Active Tracking",
          notificationBody: "Recording lesson telemetry...",
          notificationColor: COLORS.secondary
        }
      });
    })();
  }, []);

  const syncOfflineFaults = async () => {
    try {
      const queueJson = await AsyncStorage.getItem(FAULT_QUEUE_KEY);
      if (queueJson) {
        const queue = JSON.parse(queueJson);
        if (queue && queue.length > 0) {
          let currentCoords = { latitude: 0, longitude: 0 };
          try {
             const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
             currentCoords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          } catch(e) {}

          const response = await fetch(`${API_URL}/lessons/${MOCK_LESSON_ID}/heartbeat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              school_id: MOCK_SCHOOL_ID,
              coordinates: currentCoords,
              faultPins: queue,
            }),
          });

          if (response.ok) {
            const currentQueueJson = await AsyncStorage.getItem(FAULT_QUEUE_KEY);
            const currentQueue = currentQueueJson ? JSON.parse(currentQueueJson) : [];
            const remainingQueue = currentQueue.filter(
              (p: any) => !queue.some((syncedPin: any) => syncedPin.timestamp === p.timestamp && syncedPin.category === p.category)
            );

            if (remainingQueue.length === 0) {
              await AsyncStorage.removeItem(FAULT_QUEUE_KEY);
            } else {
              await AsyncStorage.setItem(FAULT_QUEUE_KEY, JSON.stringify(remainingQueue));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error syncing offline faults:', error);
    }
  };

  const handleFaultTap = async (type: 'major' | 'minor') => {
    if (type === 'major') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (!hasLocationPermission) {
      Alert.alert('Error', 'Location permission is required.');
      return;
    }

    let location;
    try {
      location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    } catch (e) {
      Alert.alert('Error', 'Could not get location.');
      return;
    }

    const faultPin = {
      category: selectedCategory,
      type,
      notes: `Automatic log for ${selectedCategory} (${type})`,
      timestamp: new Date().toISOString(),
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    };

    const saveToOfflineQueue = async (pin: any) => {
      try {
        const queueJson = await AsyncStorage.getItem(FAULT_QUEUE_KEY);
        const queue = queueJson ? JSON.parse(queueJson) : [];
        queue.push(pin);
        await AsyncStorage.setItem(FAULT_QUEUE_KEY, JSON.stringify(queue));
      } catch (err) {
        console.error('Failed to save to offline queue', err);
      }
    };

    if (!isSocketConnected) {
      await saveToOfflineQueue(faultPin);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/lessons/${MOCK_LESSON_ID}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_id: MOCK_SCHOOL_ID,
          coordinates: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          faultPins: [faultPin],
        }),
      });

      if (!response.ok) {
        await saveToOfflineQueue(faultPin);
      }
    } catch (error) {
      await saveToOfflineQueue(faultPin);
    }
  };

  const handleEndLesson = async () => {
    Alert.alert(
      'End Lesson',
      'Are you sure you want to finish this lesson? A report will be sent to the student.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Lesson',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/lessons/${MOCK_LESSON_ID}/finish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  school_id: MOCK_SCHOOL_ID,
                }),
              });
              if (response.ok) {
                Alert.alert('Success', 'Lesson finished and report sent.');
              } else {
                throw new Error('Failed to end lesson');
              }
            } catch (e) {
              Alert.alert('Error', 'Failed to end lesson.');
            }
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Modal visible={isVehicleModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>VEHICLE CHECK-IN</Text>
          <Text style={styles.modalSubtitle}>Select your vehicle for today's session</Text>
          <View style={styles.vehicleList}>
            {MOCK_VEHICLES.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={styles.vehicleCard}
                onPress={() => {
                  setSelectedVehicle(v.name);
                  setIsVehicleModalVisible(false);
                }}
              >
                <Text style={styles.vehicleName}>{v.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>

      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>ACTIVE LESSON</Text>
            <Text style={styles.subtitle}>Session: #L-12345</Text>
          </View>
          {selectedVehicle && (
             <View style={styles.vehicleBadge}>
                <Text style={styles.vehicleBadgeText}>{selectedVehicle}</Text>
             </View>
          )}
        </View>

        <View style={styles.categorySelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {FAULT_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat && styles.categoryChipActive
                ]}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive
                ]}>
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.hudGrid}>
          <TouchableOpacity
            style={[styles.hudButton, styles.buttonMinor]}
            onPress={() => handleFaultTap('minor')}
            activeOpacity={0.8}
          >
            <Text style={styles.hudButtonLabel}>MINOR</Text>
            <Text style={styles.hudButtonMain}>FAULT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.hudButton, styles.buttonMajor]}
            onPress={() => handleFaultTap('major')}
            activeOpacity={0.8}
          >
            <Text style={styles.hudButtonLabel}>MAJOR</Text>
            <Text style={styles.hudButtonMain}>FAULT</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={styles.dashcamButton}
              onPress={async () => {
                try {
                  const response = await fetch(`${API_URL}/lessons/${MOCK_LESSON_ID}/sync-dashcam`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      school_id: MOCK_SCHOOL_ID,
                      dashcam_start_time: new Date().toISOString()
                    }),
                  });
                  if (response.ok) {
                    Alert.alert('Success', 'Dashcam sync point captured.');
                  } else {
                    throw new Error('Sync failed');
                  }
                } catch (e) {
                  Alert.alert('Error', 'Failed to sync dashcam.');
                }
              }}
            >
              <Text style={styles.dashcamButtonText}>SYNC DASHCAM</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.endLessonButton}
              onPress={handleEndLesson}
            >
              <Text style={styles.endLessonButtonText}>END LESSON</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 40,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textVariant,
    letterSpacing: 2,
    marginTop: 4,
  },
  vehicleBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  vehicleBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '900',
  },
  categorySelector: {
    marginBottom: 32,
  },
  scrollContent: {
    paddingRight: 24,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderRadius: 30,
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textVariant,
    letterSpacing: 1,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  hudGrid: {
    flex: 1,
    gap: 24,
    marginBottom: 32,
  },
  hudButton: {
    flex: 1,
    borderRadius: 32,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  buttonMinor: {
    backgroundColor: COLORS.secondary,
  },
  buttonMajor: {
    backgroundColor: COLORS.major,
  },
  hudButtonLabel: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
    opacity: 0.8,
  },
  hudButtonMain: {
    color: COLORS.white,
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -4,
    lineHeight: 64,
  },
  footer: {
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  dashcamButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  dashcamButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  endLessonButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.major,
  },
  endLessonButtonText: {
    color: COLORS.major,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalContainer: {
    flex: 1,
    padding: 40,
    backgroundColor: COLORS.surface,
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.textVariant,
    marginBottom: 40,
  },
  vehicleList: {
    gap: 16,
  },
  vehicleCard: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
