import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RaceOrchestrator } from '../RaceOrchestrator';
import * as raceSimulator from '@/utils/raceSimulator';

// Mock raceSimulator module
vi.mock('@/utils/raceSimulator', () => ({
  simulateRace: vi.fn()
}));

describe('RaceOrchestrator', () => {
  let orchestrator;
  let mockHorses;

  beforeEach(() => {
    orchestrator = new RaceOrchestrator();
    
    mockHorses = [
      { id: 1, name: 'Horse 1', condition: 85 },
      { id: 2, name: 'Horse 2', condition: 92 }
    ];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with empty controllers array', () => {
      expect(orchestrator.animationControllers).toEqual([]);
    });

    it('should initialize isPaused as false', () => {
      expect(orchestrator.isPaused).toBe(false);
    });

    it('should initialize onPositionUpdate as null', () => {
      expect(orchestrator.onPositionUpdate).toBeNull();
    });
  });

  describe('runRound', () => {
    it('should call simulateRace with correct parameters', async () => {
      const distance = 1200;
      const onPositionUpdate = vi.fn();

      const mockPromise = Promise.resolve([]);
      mockPromise.controllers = [];
      raceSimulator.simulateRace.mockReturnValue(mockPromise);

      await orchestrator.runRound(mockHorses, distance, onPositionUpdate);

      expect(raceSimulator.simulateRace).toHaveBeenCalledWith(
        mockHorses,
        distance,
        expect.any(Function)
      );
    });

    it('should store position update callback', async () => {
      const distance = 1200;
      const onPositionUpdate = vi.fn();

      const mockPromise = Promise.resolve([]);
      mockPromise.controllers = [];
      raceSimulator.simulateRace.mockReturnValue(mockPromise);

      await orchestrator.runRound(mockHorses, distance, onPositionUpdate);

      expect(orchestrator.onPositionUpdate).toBe(onPositionUpdate);
    });

    it('should call onPositionUpdate when race simulator updates positions', async () => {
      const distance = 1200;
      const onPositionUpdate = vi.fn();

      const mockPromise = Promise.resolve([]);
      mockPromise.controllers = [];

      raceSimulator.simulateRace.mockImplementation((horses, dist, callback) => {
        callback(1, 500);
        callback(2, 450);
        return mockPromise;
      });

      await orchestrator.runRound(mockHorses, distance, onPositionUpdate);

      expect(onPositionUpdate).toHaveBeenCalledWith(1, 500);
      expect(onPositionUpdate).toHaveBeenCalledWith(2, 450);
    });

    it('should return race results', async () => {
      const distance = 1200;
      const onPositionUpdate = vi.fn();

      const mockResults = [
        { id: 1, position: 1 },
        { id: 2, position: 2 }
      ];
      const mockPromise = Promise.resolve(mockResults);
      mockPromise.controllers = [];
      raceSimulator.simulateRace.mockReturnValue(mockPromise);

      const results = await orchestrator.runRound(mockHorses, distance, onPositionUpdate);

      expect(results).toEqual(mockResults);
    });

    it('should cleanup controllers after round completes', async () => {
      const distance = 1200;
      const onPositionUpdate = vi.fn();

      const mockControllers = [
        { cancel: vi.fn() },
        { cancel: vi.fn() }
      ];

      const mockPromise = Promise.resolve([]);
      mockPromise.controllers = mockControllers;
      raceSimulator.simulateRace.mockReturnValue(mockPromise);

      await orchestrator.runRound(mockHorses, distance, onPositionUpdate);

      mockControllers.forEach(controller => {
        expect(controller.cancel).toHaveBeenCalled();
      });
      expect(orchestrator.animationControllers).toEqual([]);
    });

    it('should cleanup even if race fails', async () => {
      const distance = 1200;
      const onPositionUpdate = vi.fn();

      const mockControllers = [{ cancel: vi.fn() }];
      const mockError = new Error('Race simulation failed');
      const rejectedPromise = Promise.reject(mockError);
      rejectedPromise.controllers = mockControllers;
      raceSimulator.simulateRace.mockReturnValue(rejectedPromise);

      await expect(
        orchestrator.runRound(mockHorses, distance, onPositionUpdate)
      ).rejects.toThrow('Race simulation failed');

      mockControllers.forEach(controller => {
        expect(controller.cancel).toHaveBeenCalled();
      });
      expect(orchestrator.animationControllers).toEqual([]);
    });
  });

  describe('pause', () => {
    it('should set isPaused to true', () => {
      orchestrator.pause();
      expect(orchestrator.isPaused).toBe(true);
    });

    it('should call pause on all controllers', () => {
      const mockControllers = [
        { pause: vi.fn() },
        { pause: vi.fn() }
      ];
      orchestrator.animationControllers = mockControllers;

      orchestrator.pause();

      mockControllers.forEach(controller => {
        expect(controller.pause).toHaveBeenCalled();
      });
    });

    it('should handle controllers without pause method', () => {
      orchestrator.animationControllers = [
        { pause: vi.fn() },
        {},
        null
      ];

      expect(() => orchestrator.pause()).not.toThrow();
    });
  });

  describe('resume', () => {
    it('should set isPaused to false', () => {
      orchestrator.isPaused = true;
      orchestrator.resume();
      expect(orchestrator.isPaused).toBe(false);
    });

    it('should call resume on all controllers', () => {
      const mockControllers = [
        { resume: vi.fn() },
        { resume: vi.fn() }
      ];
      orchestrator.animationControllers = mockControllers;

      orchestrator.resume();

      mockControllers.forEach(controller => {
        expect(controller.resume).toHaveBeenCalled();
      });
    });

    it('should handle controllers without resume method', () => {
      orchestrator.animationControllers = [
        { resume: vi.fn() },
        {},
        null
      ];

      expect(() => orchestrator.resume()).not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should call cancel on all controllers', () => {
      const mockControllers = [
        { cancel: vi.fn() },
        { cancel: vi.fn() }
      ];
      orchestrator.animationControllers = mockControllers;

      orchestrator.cleanup();

      mockControllers.forEach(controller => {
        expect(controller.cancel).toHaveBeenCalled();
      });
    });

    it('should clear controllers array', () => {
      orchestrator.animationControllers = [{ cancel: vi.fn() }];
      orchestrator.cleanup();
      expect(orchestrator.animationControllers).toEqual([]);
    });

    it('should handle controllers without cancel method', () => {
      const mockController = { cancel: vi.fn() };
      orchestrator.animationControllers = [mockController, {}, null];

      expect(() => orchestrator.cleanup()).not.toThrow();
      expect(mockController.cancel).toHaveBeenCalled();
      expect(orchestrator.animationControllers).toEqual([]);
    });

    it('should be safe to call multiple times', () => {
      orchestrator.cleanup();
      expect(() => orchestrator.cleanup()).not.toThrow();
    });
  });

  describe('isActive', () => {
    it('should return false when no controllers', () => {
      expect(orchestrator.isActive()).toBe(false);
    });

    it('should return true when controllers exist', () => {
      orchestrator.animationControllers = [{}];
      expect(orchestrator.isActive()).toBe(true);
    });

    it('should return false after cleanup', () => {
      orchestrator.animationControllers = [{ cancel: vi.fn() }];
      orchestrator.cleanup();
      expect(orchestrator.isActive()).toBe(false);
    });
  });
});