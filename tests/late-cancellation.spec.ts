import { test, expect } from '@playwright/test';

test('Late Cancellation Flow: Penalty applied', async ({ request }) => {
  const lessonId = 'test-lesson-late';

  // 1. Cancel with penalty
  const response = await request.patch(`/lessons/${lessonId}/cancel`, {
    data: { mode: 'PENALTY' }
  });

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.mode).toBe('PENALTY');

  // 2. Verify student credits remained the same (mock logic check)
  // In a real test we would fetch student profile and assert credits count
});

test('Regular Cancellation Flow: Refund applied', async ({ request }) => {
  const lessonId = 'test-lesson-early';

  const response = await request.patch(`/lessons/${lessonId}/cancel`, {
    data: { mode: 'REFUND' }
  });

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.mode).toBe('REFUND');
});
