import { prisma } from "@repo/database";

export const getHotspots = async (studentId: string) => {
  // Mock logic for geographic clustering of faults
  return [
    { latitude: 50.0755, longitude: 14.4378, count: 12, category: "Yielding" },
    { latitude: 50.0835, longitude: 14.4178, count: 8, category: "Speeding" }
  ];
};

export const getReadinessScore = async (studentId: string) => {
  const student = await (prisma as any).student.findUnique({
    where: { id: studentId },
    include: {
        school: {
            include: { country: true }
        }
    }
  });

  if (!student) return 0;

  // In a real scenario, we'd use country-specific rules or thresholds
  // Example: CZ requires 28 hours, SK might require different.
  const hoursRequired = student.school.country?.isoCode === 'CZ' ? 28 : 30;

  return 75; // Mock score
};
