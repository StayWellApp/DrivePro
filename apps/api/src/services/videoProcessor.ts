import { FaultPin, Lesson } from "@repo/database";

/**
 * Calculates the offset in seconds within a video for a specific event timestamp.
 *
 * @param eventTimestamp The timestamp when the event occurred.
 * @param videoStartTime The timestamp when the video recording started.
 * @returns The offset in seconds, or null if videoStartTime is missing.
 */
export function calculateVideoOffset(eventTimestamp: Date, videoStartTime: Date | null): number | null {
  if (!videoStartTime) return null;

  const diffMs = eventTimestamp.getTime() - videoStartTime.getTime();
  // Return offset in seconds. If negative (event before video started), return 0 or null.
  return Math.max(0, Math.round(diffMs / 1000));
}

/**
 * Enriches a fault pin with video offset information if possible.
 */
export function enrichFaultWithVideoOffset(fault: any, lesson: any) {
  if (lesson.videoStartTime) {
    const offset = calculateVideoOffset(new Date(fault.timestamp), new Date(lesson.videoStartTime));
    return {
      ...fault,
      video_offset_seconds: offset
    };
  }
  return fault;
}
