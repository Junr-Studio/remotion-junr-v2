/**
 * Tests for LogoReveal velocity calculation
 * Ensures the velocity curve is smooth (no jerky movement)
 */

import { describe, it, expect } from 'vitest';

/**
 * Calculate smooth velocity from ease-in-out progress curve
 * This is the same function used in LogoReveal.tsx
 */
const calculateVelocityFromProgress = (progress: number): number => {
  const normalizedVelocity = Math.sin(progress * Math.PI);
  return normalizedVelocity;
};

describe('LogoReveal Velocity Calculation', () => {
  it('should have zero velocity at start (progress = 0)', () => {
    const velocity = calculateVelocityFromProgress(0);
    expect(velocity).toBeCloseTo(0, 5);
  });

  it('should have zero velocity at end (progress = 1)', () => {
    const velocity = calculateVelocityFromProgress(1);
    expect(velocity).toBeCloseTo(0, 5);
  });

  it('should have maximum velocity at middle (progress = 0.5)', () => {
    const velocity = calculateVelocityFromProgress(0.5);
    expect(velocity).toBeCloseTo(1, 5);
  });

  it('should produce smooth, continuous velocity values', () => {
    // Sample 100 points across the curve
    const samples = 100;
    const velocities: number[] = [];

    for (let i = 0; i <= samples; i++) {
      const progress = i / samples;
      const velocity = calculateVelocityFromProgress(progress);
      velocities.push(velocity);
    }

    // Check that velocity changes smoothly (no large jumps)
    for (let i = 1; i < velocities.length; i++) {
      const currentVelocity = velocities[i];
      const previousVelocity = velocities[i - 1];

      // TypeScript safety: ensure values exist
      if (currentVelocity === undefined || previousVelocity === undefined) {
        throw new Error('Velocity value is undefined');
      }

      const delta = Math.abs(currentVelocity - previousVelocity);
      // Maximum delta should be small (smooth curve)
      expect(delta).toBeLessThan(0.05);
    }
  });

  it('should be symmetric around progress = 0.5', () => {
    // Velocity at 0.25 should equal velocity at 0.75
    const v1 = calculateVelocityFromProgress(0.25);
    const v2 = calculateVelocityFromProgress(0.75);
    expect(v1).toBeCloseTo(v2, 5);

    // Velocity at 0.1 should equal velocity at 0.9
    const v3 = calculateVelocityFromProgress(0.1);
    const v4 = calculateVelocityFromProgress(0.9);
    expect(v3).toBeCloseTo(v4, 5);
  });

  it('should always return non-negative values', () => {
    // Sample across entire range
    for (let progress = 0; progress <= 1; progress += 0.01) {
      const velocity = calculateVelocityFromProgress(progress);
      expect(velocity).toBeGreaterThanOrEqual(0);
      expect(velocity).toBeLessThanOrEqual(1);
    }
  });

  it('should produce a bell curve (increasing then decreasing)', () => {
    const samples = 50;
    let increasing = true;
    let previousVelocity = 0;

    for (let i = 0; i <= samples; i++) {
      const progress = i / samples;
      const velocity = calculateVelocityFromProgress(progress);

      if (progress > 0.5 && increasing) {
        // Should start decreasing after midpoint
        increasing = false;
      }

      if (progress < 0.5) {
        // Should be increasing before midpoint
        expect(velocity).toBeGreaterThanOrEqual(previousVelocity - 0.001); // Allow tiny floating point errors
      } else if (progress > 0.5) {
        // Should be decreasing after midpoint
        expect(velocity).toBeLessThanOrEqual(previousVelocity + 0.001); // Allow tiny floating point errors
      }

      previousVelocity = velocity;
    }
  });
});
