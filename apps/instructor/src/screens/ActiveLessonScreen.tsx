import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
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

// Mock values since we don't have auth state yet
const MOCK_LESSON_ID = 'lesson-123';
const MOCK_SCHOOL_ID = 'school-456';
// Local or production API
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080';

const FAULT_QUEUE_KEY = '@fault_queue';

// Initialize socket connection outside the component or inside useEffect. Let's do it outside for singleton use.
const socket = io(API_URL);

export function ActiveLessonScreen() {
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);

  // Sync offline faults when socket connects
  const syncOfflineFaults = async () => {
    try {
      const queueJson = await AsyncStorage.getItem(FAULT_QUEUE_KEY);
      if (queueJson) {
        const queue = JSON.parse(queueJson);
        if (queue && queue.length > 0) {
          // Send all queued faults at once. We'll send an empty coordinates payload if we don't have current GPS for sync,
          // or we can fetch current. The backend heartbeat endpoint accepts an array of faultPins.
          console.log(`Syncing ${queue.length} offline faults...`);

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
            // Read again to avoid overwriting faults added during the fetch
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
            console.log('Successfully synced offline faults.');
          }
        }
      }
    } catch (error) {
      console.error('Error syncing offline faults:', error);
    }
  };

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

  const [hasLocationPermission, setHasLocationPermission] = useState(false);

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

  const handleFaultTap = async (category: string) => {
    // 1. Trigger haptic feedback immediately (Double-Pulse)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 150);

    if (!hasLocationPermission) {
      Alert.alert('Error', 'Location permission is required to pin faults.');
      return;
    }

    let location;
    try {
      // 2. Capture GPS coordinate and timestamp
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
    } catch (e) {
      Alert.alert('Error', 'Could not get location.');
      return;
    }

    const timestamp = new Date().toISOString();

    const faultPin = {
      category,
      timestamp,
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
        console.log('Fault pinned offline. Will sync when connected.');
      } catch (err) {
        console.error('Failed to save to offline queue', err);
      }
    };

    if (!isSocketConnected) {
      // Offline: immediately queue it
      await saveToOfflineQueue(faultPin);
      return;
    }

    try {
      // 3. Send to API Heartbeat Endpoint
      const response = await fetch(`${API_URL}/lessons/${MOCK_LESSON_ID}/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        console.error('Failed to save fault pin:', await response.text());
        // Fallback to queue if server returns an error like 5xx
        await saveToOfflineQueue(faultPin);
      }
    } catch (error) {
      console.error('Error in fault pinning:', error);
      // Fallback to queue on network error
      await saveToOfflineQueue(faultPin);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Active Lesson</Text>
      <Text style={styles.subHeaderText}>Tap a category to pin a fault</Text>

      <View style={styles.grid}>
        {FAULT_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={styles.button}
            onPress={() => handleFaultTap(category)}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>{category}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    marginTop: 40,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  button: {
    width: '48%', // 2 columns
    aspectRatio: 1, // square buttons
    backgroundColor: '#ff4444',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
