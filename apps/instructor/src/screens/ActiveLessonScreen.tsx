import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';

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

export function ActiveLessonScreen() {
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
    // 1. Trigger haptic feedback immediately
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (!hasLocationPermission) {
      Alert.alert('Error', 'Location permission is required to pin faults.');
      return;
    }

    try {
      // 2. Capture GPS coordinate and timestamp
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const timestamp = new Date().toISOString();

      const faultPin = {
        category,
        timestamp,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      };

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
        Alert.alert('Error', 'Failed to save fault pin. Please try again.');
      }
    } catch (error) {
      console.error('Error in fault pinning:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
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
