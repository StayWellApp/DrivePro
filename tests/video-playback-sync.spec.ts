import { test, expect } from '@playwright/test';

test('video-map sync functionality', async ({ page }) => {
  // Login as student
  await page.goto('/en/login');
  await page.fill('input[type="email"]', 'student@example.com');
  await page.fill('input[type="password"]', 'student123');
  await page.click('button[type="submit"]');

  // Go to a lesson replay page (mock ID)
  await page.goto('/en/lessons/l-12345');

  // Wait for map and scrubber
  const scrubber = page.locator('.telemetry-scrubber');
  await expect(scrubber).toBeVisible();

  // Check for video player or processing placeholder
  const videoContainer = page.locator('.video-player-container');
  await expect(videoContainer).toBeVisible();

  // If video is READY, test sync
  const player = page.locator('video-js');
  if (await player.isVisible()) {
    // Initial car position
    const car = page.locator('.custom-car-icon');
    await expect(car).toBeVisible();
    const initialBox = await car.boundingBox();

    // Seek video to 5 seconds
    await page.evaluate(() => {
      const vjsPlayer = (window as any).videojs?.getPlayer(document.querySelector('video-js')!);
      if (vjsPlayer) vjsPlayer.currentTime(5);
    });

    // Wait for car icon to move
    await page.waitForTimeout(1000);
    const newBox = await car.boundingBox();

    expect(newBox?.x).not.toBe(initialBox?.x);
  }
});
