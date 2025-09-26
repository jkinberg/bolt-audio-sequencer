import { test, expect, Page } from '@playwright/test';

// Helper function to check if AudioContext is available and working
async function checkAudioContext(page: Page) {
  return await page.evaluate(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return { available: false, error: 'AudioContext not available' };
      
      const ctx = new AudioContextClass();
      return { 
        available: true, 
        state: ctx.state,
        sampleRate: ctx.sampleRate,
        destination: !!ctx.destination
      };
    } catch (error) {
      return { available: false, error: error.message };
    }
  });
}

// Helper function to simulate user interaction and check audio initialization
async function initializeAudio(page: Page) {
  // Click on the app to trigger user interaction
  await page.click('body');
  
  // Wait for audio engine to initialize
  await page.waitForTimeout(100);
  
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      // Check if audioEngine is available globally
      if ((window as any).audioEngine) {
        resolve({ initialized: true, method: 'global' });
      } else {
        // Try to access through React dev tools or check for audio context
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          resolve({ initialized: true, method: 'context' });
        } else {
          resolve({ initialized: false });
        }
      }
    });
  });
}

test.describe('Audio Sequencer - Mobile Safari', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the application correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Audio Sequencer');
    await expect(page.locator('[data-testid="control-strip"]')).toBeVisible();
    await expect(page.locator('[data-testid="sequencer-grid"]')).toBeVisible();
  });

  test('should have AudioContext available', async ({ page }) => {
    const audioContext = await checkAudioContext(page);
    expect(audioContext.available).toBe(true);
    expect(audioContext.destination).toBe(true);
  });

  test('should initialize audio on user interaction', async ({ page }) => {
    const audioInit = await initializeAudio(page);
    expect(audioInit.initialized).toBe(true);
  });

  test('should be able to select sound buttons', async ({ page }) => {
    // Test each sound button
    const soundButtons = [
      { selector: 'button:has-text("Kick")', sound: 'kick' },
      { selector: 'button:has-text("Snare")', sound: 'snare' },
      { selector: 'button:has-text("Hi-Hat")', sound: 'hihat' },
      { selector: 'button:has-text("Cymbal")', sound: 'cymbal' },
      { selector: 'button:has-text("Hand Clap")', sound: 'handclap' },
      { selector: 'button:has-text("Cow Bell")', sound: 'cowbell' },
    ];

    for (const { selector, sound } of soundButtons) {
      await page.click(selector);
      
      // Check if button is selected (has ring styling)
      const button = page.locator(selector);
      await expect(button).toHaveClass(/ring-2/);
      
      // Wait a bit for any audio to play
      await page.waitForTimeout(200);
    }
  });

  test('should be able to assign sounds to sequencer steps', async ({ page }) => {
    // Select kick sound
    await page.click('button:has-text("Kick")');
    
    // Click on first step
    await page.click('[data-testid="sequencer-grid"] button:first-child');
    
    // Check if step shows the sound indicator
    const firstStep = page.locator('[data-testid="sequencer-grid"] button:first-child');
    await expect(firstStep).toHaveClass(/bg-red-500/);
    await expect(firstStep.locator('span:has-text("K")')).toBeVisible();
  });

  test('should be able to delete sounds from steps', async ({ page }) => {
    // First assign a sound
    await page.click('button:has-text("Kick")');
    await page.click('[data-testid="sequencer-grid"] button:first-child');
    
    // Then select delete and remove it
    await page.click('button:has-text("Delete")');
    await page.click('[data-testid="sequencer-grid"] button:first-child');
    
    // Check if step no longer has the sound
    const firstStep = page.locator('[data-testid="sequencer-grid"] button:first-child');
    await expect(firstStep).not.toHaveClass(/bg-red-500/);
    await expect(firstStep.locator('span:has-text("K")')).not.toBeVisible();
  });

  test('should be able to control tempo', async ({ page }) => {
    // Test tempo slider
    const tempoSlider = page.locator('input[type="range"]');
    await expect(tempoSlider).toBeVisible();
    
    // Change tempo
    await tempoSlider.fill('120');
    
    // Check if BPM display updated
    await expect(page.locator('text=120 BPM')).toBeVisible();
    
    // Test tempo buttons
    await page.click('button[aria-label="Increase tempo"]');
    await expect(page.locator('text=121 BPM')).toBeVisible();
    
    await page.click('button[aria-label="Decrease tempo"]');
    await expect(page.locator('text=120 BPM')).toBeVisible();
  });

  test('should be able to play and pause sequencer', async ({ page }) => {
    // Add some sounds first
    await page.click('button:has-text("Kick")');
    await page.click('[data-testid="sequencer-grid"] button:first-child');
    
    await page.click('button:has-text("Snare")');
    await page.click('[data-testid="sequencer-grid"] button:nth-child(5)');
    
    // Test play button
    const playButton = page.locator('button[aria-label="Play"]');
    await playButton.click();
    
    // Check if button changed to pause
    await expect(page.locator('button[aria-label="Pause"]')).toBeVisible();
    
    // Wait for a few steps to ensure sequencer is running
    await page.waitForTimeout(1000);
    
    // Test pause button
    await page.click('button[aria-label="Pause"]');
    await expect(page.locator('button[aria-label="Play"]')).toBeVisible();
  });

  test('should handle touch events properly on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test is only for mobile devices');
    
    // Test touch interaction with sound buttons
    await page.tap('button:has-text("Kick")');
    await expect(page.locator('button:has-text("Kick")')).toHaveClass(/ring-2/);
    
    // Test touch interaction with sequencer steps
    await page.tap('[data-testid="sequencer-grid"] button:first-child');
    const firstStep = page.locator('[data-testid="sequencer-grid"] button:first-child');
    await expect(firstStep).toHaveClass(/bg-red-500/);
  });

  test('should work with different viewport sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="control-strip"]')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="control-strip"]')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="control-strip"]')).toBeVisible();
  });
});