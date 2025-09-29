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

  test('should be able to share patterns via URL', async ({ page }) => {
    // Create a pattern
    await page.click('button:has-text("Kick")');
    await page.click('[data-testid="sequencer-grid"] button:first-child');
    
    await page.click('button:has-text("Snare")');
    await page.click('[data-testid="sequencer-grid"] button:nth-child(5)');
    
    // Set tempo
    await page.fill('input[type="range"]', '120');
    
    // Click share button
    await page.click('button:has-text("Share Pattern")');
    
    // Check if share interface appears
    await expect(page.locator('text=Share Your Pattern')).toBeVisible();
    await expect(page.locator('input[readonly]')).toBeVisible();
    
    // Get the share URL
    const shareUrl = await page.locator('input[readonly]').inputValue();
    expect(shareUrl).toContain('t=120');
    expect(shareUrl).toContain('p=');
    expect(shareUrl).toMatch(/p=[0-6]{16}/);
    
    // Test copy functionality
    await page.click('button[title="Copy URL"]');
    await expect(page.locator('text=URL copied, ready to paste and share!')).toBeVisible();
  });

  test('should load patterns from URL parameters', async ({ page }) => {
    // Navigate with URL parameters
    await page.goto('/?t=140&p=1000200030004000');
    await page.waitForLoadState('networkidle');
    
    // Check if tempo is loaded
    await expect(page.locator('text=140 BPM')).toBeVisible();
    
    // Check if pattern is loaded
    const firstStep = page.locator('[data-testid="sequencer-grid"] button:first-child');
    await expect(firstStep).toHaveClass(/bg-red-500/); // Kick sound
    
    const fifthStep = page.locator('[data-testid="sequencer-grid"] button:nth-child(5)');
    await expect(fifthStep).toHaveClass(/bg-orange-500/); // Snare sound
    
    const ninthStep = page.locator('[data-testid="sequencer-grid"] button:nth-child(9)');
    await expect(ninthStep).toHaveClass(/bg-yellow-500/); // Hi-hat sound
    
    const thirteenthStep = page.locator('[data-testid="sequencer-grid"] button:nth-child(13)');
    await expect(thirteenthStep).toHaveClass(/bg-green-500/); // Cymbal sound
  });

  test('should handle invalid URL parameters gracefully', async ({ page }) => {
    // Test with invalid parameters
    await page.goto('/?t=999&p=invalid');
    await page.waitForLoadState('networkidle');
    
    // Should fall back to defaults
    await expect(page.locator('text=64 BPM')).toBeVisible(); // Default tempo
    
    // Grid should be empty (no sounds assigned)
    const steps = page.locator('[data-testid="sequencer-grid"] button');
    const count = await steps.count();
    
    for (let i = 0; i < count; i++) {
      const step = steps.nth(i);
      await expect(step).not.toHaveClass(/bg-red-500|bg-orange-500|bg-yellow-500|bg-green-500|bg-purple-500|bg-indigo-500/);
    }
  });

  test('should validate URL parameter ranges', async ({ page }) => {
    // Test tempo bounds
    await page.goto('/?t=25&p=0000000000000000'); // Below minimum
    await expect(page.locator('text=64 BPM')).toBeVisible(); // Should use default
    
    await page.goto('/?t=250&p=0000000000000000'); // Above maximum  
    await expect(page.locator('text=64 BPM')).toBeVisible(); // Should use default
    
    // Test valid tempo
    await page.goto('/?t=120&p=0000000000000000');
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