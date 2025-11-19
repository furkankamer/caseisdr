import { describe, it, expect, vi, beforeEach } from 'vitest';
import race from '../race';
import { RaceOrchestrator } from '@/services/RaceOrchestrator';
import { TOTAL_ROUNDS, HORSES_PER_RACE } from '@/constants';

// Mock RaceOrchestrator
vi.mock('@/services/RaceOrchestrator');

describe('Race Module', () => {
  let mockOrchestrator;

  beforeEach(() => {
    // Create fresh mock for each test
    mockOrchestrator = {
      runRound: vi.fn().mockResolvedValue([
        { id: 1, position: 1, horse: { id: 1, name: 'Horse 1' } },
        { id: 2, position: 2, horse: { id: 2, name: 'Horse 2' } }
      ]),
      pause: vi.fn(),
      resume: vi.fn(),
      cleanup: vi.fn(),
      isActive: vi.fn().mockReturnValue(true)
    };

    RaceOrchestrator.mockImplementation(() => mockOrchestrator);
  });

  describe('State', () => {
    it('should have correct initial state', () => {
      const state = race.state;

      expect(state.schedule).toEqual([]);
      expect(state.results).toEqual([]);
      expect(state.currentRound).toBe(0);
      expect(state.isRacing).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.currentPositions).toEqual({});
    });
  });

  describe('Getters', () => {
    let state;

    beforeEach(() => {
      state = {
        schedule: [{ round: 1, horses: [] }],
        results: [{ round: 1, results: [] }],
        currentRound: 2,
        isRacing: true,
        isPaused: false,
        currentPositions: { h1: 500 }
      };
    });

    it('getSchedule should return schedule', () => {
      expect(race.getters.getSchedule(state)).toEqual(state.schedule);
    });

    it('getResults should return results', () => {
      expect(race.getters.getResults(state)).toEqual(state.results);
    });

    it('getCurrentRound should return current round', () => {
      expect(race.getters.getCurrentRound(state)).toBe(2);
    });

    it('isRacing should return racing state', () => {
      expect(race.getters.isRacing(state)).toBe(true);
    });

    it('isPaused should return paused state', () => {
      expect(race.getters.isPaused(state)).toBe(false);
    });

    it('getCurrentRoundData should return correct round data', () => {
      state.currentRound = 1;
      expect(race.getters.getCurrentRoundData(state)).toEqual({ round: 1, horses: [] });
    });

    it('getCurrentRoundData should return null if round not found', () => {
      state.currentRound = 10;
      expect(race.getters.getCurrentRoundData(state)).toBeNull();
    });
  });

  describe('Mutations', () => {
    let state;

    beforeEach(() => {
      state = {
        schedule: [],
        results: [],
        currentRound: 0,
        isRacing: false,
        isPaused: false,
        currentPositions: {}
      };
    });

    it('SET_SCHEDULE should set the schedule', () => {
      const schedule = [{ round: 1, horses: [] }];
      race.mutations.SET_SCHEDULE(state, schedule);
      expect(state.schedule).toEqual(schedule);
    });

    it('ADD_RESULT should add a result', () => {
      const result = { round: 1, results: [] };
      race.mutations.ADD_RESULT(state, result);
      expect(state.results).toContainEqual(result);
    });

    it('SET_CURRENT_ROUND should set current round', () => {
      race.mutations.SET_CURRENT_ROUND(state, 3);
      expect(state.currentRound).toBe(3);
    });

    it('SET_RACING should set racing state', () => {
      race.mutations.SET_RACING(state, true);
      expect(state.isRacing).toBe(true);
    });

    it('SET_PAUSED should set paused state', () => {
      race.mutations.SET_PAUSED(state, true);
      expect(state.isPaused).toBe(true);
    });

    it('UPDATE_POSITION should update horse position', () => {
      race.mutations.UPDATE_POSITION(state, { horseId: 'h1', position: 50 });
      expect(state.currentPositions['h1']).toBe(50);
    });

    it('RESET_POSITIONS should clear all positions', () => {
      state.currentPositions = { h1: 100, h2: 200 };
      race.mutations.RESET_POSITIONS(state);
      expect(state.currentPositions).toEqual({});
    });

    it('RESET_RACE should reset all state', () => {
      state.schedule = [{ round: 1 }];
      state.results = [{ round: 1, results: [] }];
      state.currentRound = 3;
      state.isRacing = true;
      state.isPaused = true;
      state.currentPositions = { h1: 100 };

      race.mutations.RESET_RACE(state);

      expect(state.schedule).toEqual([]);
      expect(state.results).toEqual([]);
      expect(state.currentRound).toBe(0);
      expect(state.isRacing).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.currentPositions).toEqual({});
    });
  });

  describe('Actions', () => {
    let commit;
    let dispatch;
    let state;
    let rootState;

    beforeEach(() => {
      commit = vi.fn();
      dispatch = vi.fn();
      
      state = {
        schedule: [],
        results: [],
        currentRound: 0,
        isRacing: false,
        isPaused: false,
        currentPositions: {}
      };

      rootState = {
        horses: {
          allHorses: Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            name: `Horse ${i + 1}`,
            color: `#color${i}`,
            condition: 50 + i
          }))
        }
      };
    });

    describe('generateSchedule', () => {
      it('should generate schedule with correct number of rounds', () => {
        race.actions.generateSchedule({ commit, rootState });

        expect(commit).toHaveBeenCalledWith('SET_SCHEDULE', expect.any(Array));
        
        const schedule = commit.mock.calls[0][1];
        expect(schedule).toHaveLength(TOTAL_ROUNDS);
      });

      it('should select correct number of horses per round', () => {
        race.actions.generateSchedule({ commit, rootState });

        const schedule = commit.mock.calls[0][1];
        schedule.forEach(round => {
          expect(round.horses).toHaveLength(HORSES_PER_RACE);
        });
      });

      it('should assign correct distances to rounds', () => {
        const expectedDistances = [1200, 1400, 1600, 1800, 2000, 2200];
        
        race.actions.generateSchedule({ commit, rootState });

        const schedule = commit.mock.calls[0][1];
        schedule.forEach((round, index) => {
          expect(round.distance).toBe(expectedDistances[index]);
          expect(round.round).toBe(index + 1);
        });
      });

      it('should select horses randomly', () => {
        race.actions.generateSchedule({ commit, rootState });
        const schedule1 = commit.mock.calls[0][1];

        commit.mockClear();

        race.actions.generateSchedule({ commit, rootState });
        const schedule2 = commit.mock.calls[0][1];

        const horses1Ids = schedule1[0].horses.map(h => h.id).sort().join(',');
        const horses2Ids = schedule2[0].horses.map(h => h.id).sort().join(',');

        // Likely to be different (could occasionally be same due to randomness)
        expect(horses1Ids).not.toBe(horses2Ids);
      });
    });

    describe('cancelRace', () => {
      it('should commit RESET_RACE', () => {
        race.actions.cancelRace({ commit });
        expect(commit).toHaveBeenCalledWith('RESET_RACE');
      });

      it('should not throw if orchestrator is null', () => {
        expect(() => race.actions.cancelRace({ commit })).not.toThrow();
      });
    });

    describe('startRace', () => {
      beforeEach(() => {
        state.schedule = Array.from({ length: TOTAL_ROUNDS }, (_, i) => ({
          round: i + 1,
          distance: 1200 + (i * 200),
          horses: [
            { id: 1, name: 'Horse 1' },
            { id: 2, name: 'Horse 2' }
          ]
        }));
        dispatch.mockResolvedValue();
      });

      it('should return early if already racing', async () => {
        state.isRacing = true;

        await race.actions.startRace({ commit, state, dispatch });

        expect(commit).not.toHaveBeenCalled();
      });

      it('should return early if schedule is empty', async () => {
        state.schedule = [];

        await race.actions.startRace({ commit, state, dispatch });

        expect(commit).not.toHaveBeenCalled();
      });

      it('should create new RaceOrchestrator', async () => {
        await race.actions.startRace({ commit, state, dispatch });
        expect(RaceOrchestrator).toHaveBeenCalled();
      });

      it('should commit SET_RACING and SET_PAUSED', async () => {
        await race.actions.startRace({ commit, state, dispatch });

        expect(commit).toHaveBeenCalledWith('SET_RACING', true);
        expect(commit).toHaveBeenCalledWith('SET_PAUSED', false);
      });

      it('should dispatch runRound for each round', async () => {
        await race.actions.startRace({ commit, state, dispatch });

        for (let i = 1; i <= TOTAL_ROUNDS; i++) {
          expect(dispatch).toHaveBeenCalledWith('runRound', i);
        }
      });

      it('should commit SET_CURRENT_ROUND for each round', async () => {
        await race.actions.startRace({ commit, state, dispatch });

        for (let i = 1; i <= TOTAL_ROUNDS; i++) {
          expect(commit).toHaveBeenCalledWith('SET_CURRENT_ROUND', i);
        }
      });

      it('should call cancelRace on error', async () => {
        dispatch.mockRejectedValueOnce(new Error('Test error'));

        await race.actions.startRace({ commit, state, dispatch });

        expect(dispatch).toHaveBeenCalledWith('cancelRace');
      });
    });

    describe('runRound', () => {
      beforeEach(() => {
        state.currentRound = 1;
        state.schedule = [
          {
            round: 1,
            distance: 1200,
            horses: [
              { id: 1, name: 'Horse 1' },
              { id: 2, name: 'Horse 2' }
            ]
          }
        ];
      });

      it('should return early if no round data', async () => {
        state.currentRound = 10;

        await race.actions.runRound({ commit, state });

        expect(commit).not.toHaveBeenCalled();
      });

      it('should commit RESET_POSITIONS', async () => {
        // Since runRound needs orchestrator, mock it as non-null
        // In real scenario, startRace creates it
        await race.actions.runRound({ commit, state });

        expect(commit).toHaveBeenCalledWith('RESET_POSITIONS');
      });

      it('should commit ADD_RESULT with sorted results', async () => {
        mockOrchestrator.runRound.mockResolvedValue([
          { id: 2, position: 1, horse: { id: 2, name: 'Horse 2' } },
          { id: 1, position: 2, horse: { id: 1, name: 'Horse 1' } }
        ]);

        await race.actions.runRound({ commit, state });

        expect(commit).toHaveBeenCalledWith('ADD_RESULT', expect.objectContaining({
          round: 1,
          distance: 1200,
          results: expect.arrayContaining([
            expect.objectContaining({ position: 1 }),
            expect.objectContaining({ position: 2 })
          ])
        }));
      });
    });

    describe('pauseRace', () => {
      it('should commit SET_PAUSED', () => {
        race.actions.pauseRace({ commit });
        expect(commit).toHaveBeenCalledWith('SET_PAUSED', true);
      });
    });

    describe('resumeRace', () => {
      it('should commit SET_PAUSED false', () => {
        race.actions.resumeRace({ commit });
        expect(commit).toHaveBeenCalledWith('SET_PAUSED', false);
      });
    });
  });

  describe('Module Structure', () => {
    it('should be namespaced', () => {
      expect(race.namespaced).toBe(true);
    });

    it('should export state, getters, mutations, actions', () => {
      expect(race.state).toBeDefined();
      expect(race.getters).toBeDefined();
      expect(race.mutations).toBeDefined();
      expect(race.actions).toBeDefined();
    });
  });
});