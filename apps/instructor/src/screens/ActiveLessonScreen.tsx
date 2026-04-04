import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';

const FAULT_CATEGORIES = [
  'Observation',
  'Junctions',
  'Roundabouts',
  'Parking',
  'Speed',
  'Positioning',
  'Signalling',
];

// Kinetic Precision Colors
const COLORS = {
  primary: '#0F172A', // Deep Navy
  secondary: '#2DD4BF', // Electric Teal
  surface: '#F7F9FB',
  major: '#EF4444', // Red
  minor: '#2DD4BF', // Teal (Electric Teal)
  textMain: '#191C1E',
  textVariant: '#45464D',
  white: '#FFFFFF',
};

const MOCK_LESSON_ID = 'lesson-123';
const MOCK_SCHOOL_ID = 'school-456';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080';
const FAULT_QUEUE_KEY = '@fault_queue';

const socket = io(API_URL);

export function ActiveLessonScreen() {
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(FAULT_CATEGORIES[0]);

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
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }
      setHasLocationPermission(true);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 150);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>ACTIVE LESSON</Text>
          <Text style={styles.subtitle}>Session: #L-12345</Text>
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
          <TouchableOpacity
            style={styles.dashcamButton}
            onPress={() => Alert.alert('Dashcam', 'Sync point set.')}
          >
            <Text style={styles.dashcamButtonText}>SYNC DASHCAM</Text>
          </TouchableOpacity>
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
    gap: 16,
  },
  dashcamButton: {
    backgroundColor: COLORS.primary,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  dashcamButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
