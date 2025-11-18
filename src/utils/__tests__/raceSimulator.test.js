import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateRaceDuration, animateHorse } from '../raceSimulator';

describe('raceSimulator', () => {
  describe('calculateRaceDuration', () => {
    it('should return faster time for better condition', () => {
      const distance = 1200;
      const perfectCondition = 100;
      const poorCondition = 10;

      const perfectTime = calculateRaceDuration(distance, perfectCondition);
      const poorTime = calculateRaceDuration(distance, poorCondition);

      expect(poorTime).toBeGreaterThan(perfectTime);
    });

    it('should calculate realistic race times', () => {
      const distance = 1200;
      const condition = 100;

      const duration = calculateRaceDuration(distance, condition);

      // Perfect condition: ~6 seconds (±5%)
      expect(duration).toBeGreaterThan(5000); // 5 seconds
      expect(duration).toBeLessThan(7000); // 7 seconds
    });

    it('should handle worst case condition (1)', () => {
      const distance = 1200;
      const worstCondition = 1;

      const duration = calculateRaceDuration(distance, worstCondition);

      // Worst case should still finish in reasonable time (<15 seconds)
      expect(duration).toBeGreaterThan(8000);
      expect(duration).toBeLessThan(15000);
    });

    it('should scale linearly with distance', () => {
      const condition = 80;
      const shortDistance = 1200;
      const longDistance = 2400; // 2x

      const shortTime = calculateRaceDuration(shortDistance, condition);
      const longTime = calculateRaceDuration(longDistance, condition);

      // Long distance should take roughly 2x time (accounting for random variance)
      const ratio = longTime / shortTime;
      expect(ratio).toBeGreaterThan(1.8);
      expect(ratio).toBeLessThan(2.2);
    });

    it('should include random variance', () => {
      const distance = 1200;
      const condition = 80;

      const times = Array.from({ length: 100 }, () =>
        calculateRaceDuration(distance, condition)
      );

      const uniqueTimes = new Set(times);

      // Should have variance (not all the same)
      expect(uniqueTimes.size).toBeGreaterThan(50);
    });
  });

  describe('animateHorse', () => {
    let mockHorse;
    let onUpdateSpy;
    let onCompleteSpy;

    beforeEach(() => {
      mockHorse = { id: 1, name: 'Test Horse' };
      onUpdateSpy = vi.fn();
      onCompleteSpy = vi.fn();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should return animation controller', () => {
      const duration = 1000;

      const controller = animateHorse(
        mockHorse,
        duration,
        onUpdateSpy,
        onCompleteSpy
      );

      expect(controller).toBeDefined();
      expect(controller.pause).toBeInstanceOf(Function);
      expect(controller.resume).toBeInstanceOf(Function);
      expect(controller.cancel).toBeInstanceOf(Function);
    });

    it('should cancel animation', () => {
      const duration = 1000;

      const controller = animateHorse(
        mockHorse,
        duration,
        onUpdateSpy,
        onCompleteSpy
      );

      // Cancel immediately
      controller.cancel();

      // Should not throw
      expect(() => controller.cancel()).not.toThrow();
    });
  });
});