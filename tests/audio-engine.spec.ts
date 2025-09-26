import { test, expect } from '@playwright/test';

test.describe('Audio Engine Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should create audio context after user interaction', async ({ page }) => {
    // Before interaction, audio context might not be initialized
    const beforeInteraction = await page.evaluate(() => {
      return {
        hasAudioContext: !!(window.AudioContext || (window as any).webkitAudioContext),
        contextState: 'unknown'
      };
    });
    
    expect(beforeInteraction.hasAudioContext).toBe(true);
    
    // Simulate user interaction
    await page.click('body');
    await page.waitForTimeout(100);
    
    // After interaction, check if audio context can be created
    const afterInteraction = await page.evaluate(() => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        return {
          created: true,
          state: ctx.state,
          sampleRate: ctx.sampleRate
        };
      } catch (error) {
        return {
          created: false,
          error: error.message
        };
      }
    });
    
    expect(afterInteraction.created).toBe(true);
    expect(['running', 'suspended']).toContain(afterInteraction.state);
  });

  test('should handle audio context resume on iOS Safari', async ({ page, browserName }) => {
    // This test is particularly important for Safari
    await page.click('body'); // User interaction required
    
    const audioContextTest = await page.evaluate(async () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        
        // If suspended, try to resume
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        
        return {
          success: true,
          initialState: ctx.state,
          finalState: ctx.state,
          canCreateNodes: !!(ctx.createOscillator && ctx.createGain)
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    expect(audioContextTest.success).toBe(true);
    expect(audioContextTest.canCreateNodes).toBe(true);
  });

  test('should be able to create audio nodes', async ({ page }) => {
    await page.click('body'); // User interaction
    
    const nodeCreationTest = await page.evaluate(() => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        
        // Test creating various audio nodes
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        return {
          success: true,
          hasOscillator: !!oscillator,
          hasGainNode: !!gainNode,
          hasFilter: !!filter,
          canConnect: typeof oscillator.connect === 'function'
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    expect(nodeCreationTest.success).toBe(true);
    expect(nodeCreationTest.hasOscillator).toBe(true);
    expect(nodeCreationTest.hasGainNode).toBe(true);
    expect(nodeCreationTest.hasFilter).toBe(true);
    expect(nodeCreationTest.canConnect).toBe(true);
  });
});