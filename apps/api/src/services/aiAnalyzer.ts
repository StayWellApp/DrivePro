import { prisma } from '@repo/database';

/**
 * Identifies geographic "Hotspots" where the student repeatedly makes mistakes.
 * Adjusted to 50m radius for precision at intersections.
 */
export async function getHotspots(studentId: string) {
  const last10Lessons = await (prisma as any).lesson.findMany({
    where: { student_id: studentId },
    take: 10,
    orderBy: { startTime: 'desc' },
    include: {
      sessions: {
        include: {
          faultPins: true
        }
      }
    }
  });

  const highRiskPins = last10Lessons.flatMap((lesson: any) =>
    lesson.sessions.flatMap((session: any) =>
      session.faultPins.filter((pin: any) => (pin.riskScore || 0) > 50)
    )
  );

  if (highRiskPins.length === 0) return [];

  const clusters: any[] = [];
  const RADIUS_METERS = 50;

  for (const pin of highRiskPins) {
    let assigned = false;
    for (const cluster of clusters) {
      const distance = calculateDistance(pin.latitude, pin.longitude, cluster.lat, cluster.lng);
      if (distance <= RADIUS_METERS) {
        cluster.pins.push(pin);
        cluster.lat = cluster.pins.reduce((sum: number, p: any) => sum + p.latitude, 0) / cluster.pins.length;
        cluster.lng = cluster.pins.reduce((sum: number, p: any) => sum + p.longitude, 0) / cluster.pins.length;
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      clusters.push({ lat: pin.latitude, lng: pin.longitude, pins: [pin] });
    }
  }

  const sortedClusters = clusters
    .sort((a, b) => b.pins.length - a.pins.length)
    .slice(0, 3);

  return sortedClusters.map(cluster => {
    const categoryCounts: Record<string, number> = {};
    cluster.pins.forEach((p: any) => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });
    const topCategory = Object.entries(categoryCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0][0];

    return {
      location: { lat: cluster.lat, lng: cluster.lng },
      count: cluster.pins.length,
      weakness: topCategory,
      insight: `Precision Hotspot: Student struggles with ${topCategory} at this intersection.`
    };
  });
}

/**
 * Calculates Exam Readiness Score (0-100)
 * Weights: 25% Theory, 50% Safety (Faults), 25% Experience (Hours)
 */
export async function getReadinessScore(studentId: string) {
  const mockAttempts = await (prisma as any).studentExamAttempt.findMany({
    where: { student_id: studentId },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  const theoryScore = mockAttempts.length > 0
    ? (mockAttempts.reduce((sum: number, a: any) => sum + (a.score / a.total), 0) / mockAttempts.length) * 100
    : 0;

  const lessons = await (prisma as any).lesson.findMany({
    where: { student_id: studentId },
    take: 10,
    orderBy: { startTime: 'desc' },
    include: { sessions: { include: { faultPins: true } } }
  });

  let faultScore = 100;
  if (lessons.length > 0) {
    const totalFaults = lessons.reduce((sum: number, l: any) =>
      sum + l.sessions.reduce((sSum: number, s: any) => sSum + s.faultPins.length, 0), 0
    );
    faultScore = Math.max(0, 100 - ((totalFaults / lessons.length) * 10));
  }

  const REQUIRED_HOURS = 28;
  const totalMinutes = lessons.reduce((sum: number, l: any) => {
    if (l.startTime && l.endTime) {
      return sum + (l.endTime.getTime() - l.startTime.getTime()) / 60000;
    }
    return sum;
  }, 0);
  const hoursScore = Math.min(100, (totalMinutes / 60 / REQUIRED_HOURS) * 100);

  const readiness = (theoryScore * 0.25) + (faultScore * 0.50) + (hoursScore * 0.25);

  return {
    score: Math.round(readiness),
    breakdown: {
      theory: Math.round(theoryScore),
      safety: Math.round(faultScore),
      experience: Math.round(hoursScore)
    }
  };
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
