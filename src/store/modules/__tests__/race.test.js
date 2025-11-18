import { describe, it, expect, beforeEach, vi } from 'vitest';
import raceModule from '../race';
import { TOTAL_ROUNDS, HORSES_PER_RACE, RACE_DISTANCES } from '@/constants';

// Mock the race simulator
vi.mock('@/utils/raceSimulator', () => ({
  simulateRace: vi.fn((horses, distance, onUpdate) => {
    // Simulate updates
    horses.forEach((horse, index) => {
      onUpdate(horse.id, index * 100);
    });
    
    // Return mock results
    const mockPromise = Promise.resolve(
      horses.map((horse, index) => ({
        ...horse,
        position: index + 1,
        finishTime: 5000 + index * 100
      }))
    );
    
    // Attach controllers
    mockPromise.controllers = horses.map(() => ({
      pause: vi.fn(),
      resume: vi.fn(),
      cancel: vi.fn()
    }));
    
    return mockPromise;
  })
}));

describe('Race Store Module', () => {
  let state;
  let mockHorses;

  beforeEach(() => {
    state = {
      schedule: [],
      results: [],
      currentRound: 0,
      isRacing: false,
      isPaused: false,
      currentPositions: {},
      animationControllers: []
    };

    mockHorses = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `Horse ${i + 1}`,
      color: `#color${i}`,
      condition: 50 + i
    }));
  });

  describe('getters', () => {
    it('getSchedule should return schedule', () => {
      state.schedule = [{ round: 1 }];
      const result = raceModule.getters.getSchedule(state);

      expect(result).toEqual(state.schedule);
    });

    it('getCurrentRoundData should return current round', () => {
      const schedule = [
        { round: 1, distance: 1200 },
        { round: 2, distance: 1400 }
      ];
      state.schedule = schedule;
      state.currentRound = 2;

      const result = raceModule.getters.getCurrentRoundData(state);

      expect(result).toEqual(schedule[1]);
    });

    it('getCurrentRoundData should return null if no round', () => {
      state.currentRound = 0;
      const result = raceModule.getters.getCurrentRoundData(state);

      expect(result).toBeNull();
    });
  });

  describe('mutations', () => {
    it('SET_SCHEDULE should update schedule', () => {
      const schedule = [{ round: 1 }];

      raceModule.mutations.SET_SCHEDULE(state, schedule);

      expect(state.schedule).toEqual(schedule);
    });

    it('SET_RACING should update racing state', () => {
      raceModule.mutations.SET_RACING(state, true);
      expect(state.isRacing).toBe(true);

      raceModule.mutations.SET_RACING(state, false);
      expect(state.isRacing).toBe(false);
    });

    it('SET_PAUSED should update paused state', () => {
      raceModule.mutations.SET_PAUSED(state, true);
      expect(state.isPaused).toBe(true);
    });

    it('SET_CURRENT_ROUND should update current round', () => {
      raceModule.mutations.SET_CURRENT_ROUND(state, 3);
      expect(state.currentRound).toBe(3);
    });

    it('UPDATE_POSITION should update horse position', () => {
      raceModule.mutations.UPDATE_POSITION(state, {
        horseId: 5,
        position: 250
      });

      expect(state.currentPositions[5]).toBe(250);
    });

    it('RESET_POSITIONS should clear all positions', () => {
      state.currentPositions = { 1: 100, 2: 200 };

      raceModule.mutations.RESET_POSITIONS(state);

      expect(state.currentPositions).toEqual({});
    });

    it('ADD_RESULT should append result', () => {
      const result = { round: 1, results: [] };

      raceModule.mutations.ADD_RESULT(state, result);

      expect(state.results).toHaveLength(1);
      expect(state.results[0]).toEqual(result);
    });

    it('SET_ANIMATION_CONTROLLERS should update controllers', () => {
      const controllers = [{ pause: vi.fn() }];

      raceModule.mutations.SET_ANIMATION_CONTROLLERS(state, controllers);

      expect(state.animationControllers).toEqual(controllers);
    });

    it('RESET_RACE should clear results and state', () => {
      state.results = [{ round: 1 }];
      state.currentRound = 3;
      state.isRacing = true;
      state.isPaused = true;

      raceModule.mutations.RESET_RACE(state);

      expect(state.results).toEqual([]);
      expect(state.currentRound).toBe(0);
      expect(state.isRacing).toBe(false);
      expect(state.isPaused).toBe(false);
    });
  });

  describe('actions - generateSchedule', () => {
    it('should create 6 rounds', () => {
      const commit = vi.fn();
      const rootState = { horses: { allHorses: mockHorses } };

      raceModule.actions.generateSchedule({ commit, rootState });

      const scheduleCall = commit.mock.calls.find(
        call => call[0] === 'SET_SCHEDULE'
      );
      const schedule = scheduleCall[1];

      expect(schedule).toHaveLength(TOTAL_ROUNDS);
    });

    it('should select 10 horses per round', () => {
      const commit = vi.fn();
      const rootState = { horses: { allHorses: mockHorses } };

      raceModule.actions.generateSchedule({ commit, rootState });

      const scheduleCall = commit.mock.calls.find(
        call => call[0] === 'SET_SCHEDULE'
      );
      const schedule = scheduleCall[1];

      schedule.forEach(round => {
        expect(round.horses).toHaveLength(HORSES_PER_RACE);
      });
    });

    it('should use correct distances', () => {
      const commit = vi.fn();
      const rootState = { horses: { allHorses: mockHorses } };

      raceModule.actions.generateSchedule({ commit, rootState });

      const scheduleCall = commit.mock.calls.find(
        call => call[0] === 'SET_SCHEDULE'
      );
      const schedule = scheduleCall[1];

      schedule.forEach((round, index) => {
        expect(round.distance).toBe(RACE_DISTANCES[index]);
      });
    });

    it('should select unique horses per round', () => {
      const commit = vi.fn();
      const rootState = { horses: { allHorses: mockHorses } };

      raceModule.actions.generateSchedule({ commit, rootState });

      const scheduleCall = commit.mock.calls.find(
        call => call[0] === 'SET_SCHEDULE'
      );
      const schedule = scheduleCall[1];

      schedule.forEach(round => {
        const horseIds = round.horses.map(h => h.id);
        const uniqueIds = new Set(horseIds);

        expect(uniqueIds.size).toBe(HORSES_PER_RACE);
      });
    });

    it('should select random horses (not same order)', () => {
      const commit = vi.fn();
      const rootState = { horses: { allHorses: mockHorses } };

      const schedules = [];
      for (let i = 0; i < 5; i++) {
        commit.mockClear();
        raceModule.actions.generateSchedule({ commit, rootState });

        const scheduleCall = commit.mock.calls.find(
          call => call[0] === 'SET_SCHEDULE'
        );
        schedules.push(scheduleCall[1]);
      }

      const firstHorseIds = schedules.map(s => s[0].horses[0].id);
      const uniqueFirstHorses = new Set(firstHorseIds);

      expect(uniqueFirstHorses.size).toBeGreaterThan(1);
    });
  });

  describe('actions - runRound', () => {
    it('should run a single round successfully', async () => {
      const commit = vi.fn();
      const schedule = [{
        round: 1,
        distance: 1200,
        horses: mockHorses.slice(0, 10)
      }];
      
      state.schedule = schedule;
      state.currentRound = 1;

      await raceModule.actions.runRound({ commit, state });

      // Should reset positions
      expect(commit).toHaveBeenCalledWith('RESET_POSITIONS');
      
      // Should set animation controllers
      expect(commit).toHaveBeenCalledWith('SET_ANIMATION_CONTROLLERS', expect.any(Array));
      
      // Should add result
      expect(commit).toHaveBeenCalledWith('ADD_RESULT', expect.objectContaining({
        round: 1,
        distance: 1200,
        results: expect.any(Array)
      }));
    });

    it('should update positions during race', async () => {
      const commit = vi.fn();
      const schedule = [{
        round: 1,
        distance: 1200,
        horses: mockHorses.slice(0, 10)
      }];
      
      state.schedule = schedule;
      state.currentRound = 1;

      await raceModule.actions.runRound({ commit, state });

      // Should call UPDATE_POSITION for each horse
      const updatePositionCalls = commit.mock.calls.filter(
        call => call[0] === 'UPDATE_POSITION'
      );
      
      expect(updatePositionCalls.length).toBeGreaterThan(0);
    });

    it('should cleanup animation controllers after race', async () => {
      const commit = vi.fn();
      const mockController = { cancel: vi.fn() };
      
      state.schedule = [{
        round: 1,
        distance: 1200,
        horses: mockHorses.slice(0, 10)
      }];
      state.currentRound = 1;
      state.animationControllers = [mockController];

      await raceModule.actions.runRound({ commit, state });

      // Should cancel controllers
      expect(mockController.cancel).toHaveBeenCalled();
      
      // Should clear controllers
      expect(commit).toHaveBeenCalledWith('SET_ANIMATION_CONTROLLERS', []);
    });

    it('should return early if no round data', async () => {
      const commit = vi.fn();
      state.schedule = [];
      state.currentRound = 1;

      await raceModule.actions.runRound({ commit, state });

      // Should not make any commits
      expect(commit).not.toHaveBeenCalled();
    });
  });

  describe('actions - startRace', () => {
    it('should return early if no schedule', async () => {
      const commit = vi.fn();
      const dispatch = vi.fn();
      state.schedule = [];

      await raceModule.actions.startRace({ commit, state, dispatch });

      expect(commit).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('should set racing state', async () => {
      const commit = vi.fn();
      const dispatch = vi.fn();
      
      state.schedule = Array.from({ length: 6 }, (_, i) => ({
        round: i + 1,
        distance: 1200 + i * 200,
        horses: mockHorses.slice(0, 10)
      }));

      // Mock runRound to resolve immediately
      dispatch.mockResolvedValue();

      await raceModule.actions.startRace({ commit, state, dispatch });

      expect(commit).toHaveBeenCalledWith('SET_RACING', true);
      expect(commit).toHaveBeenCalledWith('SET_PAUSED', false);
    });

    it('should cleanup on error', async () => {
      const commit = vi.fn();
      const dispatch = vi.fn().mockRejectedValue(new Error('Test error'));
      const mockController = { cancel: vi.fn() };
      
      state.schedule = [{ round: 1, distance: 1200, horses: mockHorses.slice(0, 10) }];
      state.animationControllers = [mockController];

      await raceModule.actions.startRace({ commit, state, dispatch });

      // Should cleanup
      expect(mockController.cancel).toHaveBeenCalled();
      expect(commit).toHaveBeenCalledWith('SET_RACING', false);
    });
  });

  describe('actions - pause and resume', () => {
    it('pauseRace should set paused and call controller.pause', () => {
      const commit = vi.fn();
      const mockController = { pause: vi.fn(), resume: vi.fn() };
      state.animationControllers = [mockController];

      raceModule.actions.pauseRace({ commit, state });

      expect(commit).toHaveBeenCalledWith('SET_PAUSED', true);
      expect(mockController.pause).toHaveBeenCalled();
    });

    it('resumeRace should set unpaused and call controller.resume', () => {
      const commit = vi.fn();
      const mockController = { pause: vi.fn(), resume: vi.fn() };
      state.animationControllers = [mockController];

      raceModule.actions.resumeRace({ commit, state });

      expect(commit).toHaveBeenCalledWith('SET_PAUSED', false);
      expect(mockController.resume).toHaveBeenCalled();
    });

    it('should handle missing controller methods gracefully', () => {
      const commit = vi.fn();
      state.animationControllers = [null, {}, { pause: vi.fn() }];

      expect(() => {
        raceModule.actions.pauseRace({ commit, state });
      }).not.toThrow();
    });
  });
});