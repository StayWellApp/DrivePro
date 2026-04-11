/**
 * Calculates the Haversine distance between two points in kilometers.
 */
function getHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface TelemetryPoint {
  lat: number;
  lng: number;
  timestamp: string | Date;
}

/**
 * Calculates the total distance and average speed from telemetry data.
 * @param coordinates Array of TelemetryPoint
 * @returns { totalDistanceKm: number, averageSpeedKmh: number }
 */
export function calculateTelemetryStats(coordinates: TelemetryPoint[]) {
  if (!coordinates || coordinates.length < 2) {
    return { totalDistanceKm: 0, averageSpeedKmh: 0 };
  }

  let totalDistance = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[i + 1];

    if (!p1 || !p2) continue;

    // Skip if jumpy signal (distance > 5km in a short interval is likely an error)
    const d = getHaversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    const dt = Math.abs(new Date(p2.timestamp).getTime() - new Date(p1.timestamp).getTime()) / 1000;

    if (d < 5 || dt > 60) { // Only add if it's not a massive jump in a tiny window
        totalDistance += d;
    }
  }

  const startTime = new Date(coordinates[0].timestamp).getTime();
  const endTime = new Date(coordinates[coordinates.length - 1].timestamp).getTime();
  const durationHours = (endTime - startTime) / (1000 * 60 * 60);

  // Avoid NaN or Infinity
  const averageSpeed = (durationHours > 0 && totalDistance > 0) ? totalDistance / durationHours : 0;

  return {
    totalDistanceKm: Number(totalDistance.toFixed(2)),
    averageSpeedKmh: Number(Math.min(averageSpeed, 200).toFixed(1)), // Capped at 200 for outliers
  };
}
