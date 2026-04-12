import { calculateVideoOffset } from './videoProcessor.js';
import { describe, it, expect } from 'vitest';

describe('calculateVideoOffset', () => {
  it('should calculate correct offset', () => {
    const videoStart = new Date('2025-01-01T10:00:00Z');
    const eventTime = new Date('2025-01-01T10:00:15Z');
    expect(calculateVideoOffset(eventTime, videoStart)).toBe(15);
  });

  it('should return 0 if event is before video start', () => {
    const videoStart = new Date('2025-01-01T10:00:00Z');
    const eventTime = new Date('2025-01-01T09:59:45Z');
    expect(calculateVideoOffset(eventTime, videoStart)).toBe(0);
  });

  it('should return null if video start is null', () => {
    const eventTime = new Date('2025-01-01T10:00:15Z');
    expect(calculateVideoOffset(eventTime, null)).toBe(null);
  });
});
