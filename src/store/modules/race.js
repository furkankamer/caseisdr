import {
  RACE_DISTANCES,
  HORSES_PER_RACE,
  TOTAL_ROUNDS,
  TOTAL_HORSES
} from '@/constants';
import { RaceOrchestrator } from '@/services/RaceOrchestrator';

// Fisher-Yates shuffle for random selection
const shuffleArray = array => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

let orchestrator = null;

const state = {
  schedule: [],
  results: [],
  currentRound: 0,
  isRacing: false,
  isPaused: false,
  currentPositions: {}
};

const getters = {
  getSchedule: state => state.schedule,
  getResults: state => state.results,
  getCurrentRound: state => state.currentRound,
  isRacing: state => state.isRacing,
  isPaused: state => state.isPaused,
  getCurrentRoundData: state => {
    return state.schedule[state.currentRound - 1] || null;
  }
};

const mutations = {
  SET_SCHEDULE(state, schedule) {
    state.schedule = schedule;
  },
  ADD_RESULT(state, result) {
    state.results.push(result);
  },
  SET_CURRENT_ROUND(state, round) {
    state.currentRound = round;
  },
  SET_RACING(state, isRacing) {
    state.isRacing = isRacing;
  },
  SET_PAUSED(state, isPaused) {
    state.isPaused = isPaused;
  },
  UPDATE_POSITION(state, { horseId, position }) {
    state.currentPositions[horseId] = position;
  },
  RESET_POSITIONS(state) {
    state.currentPositions = {};
  },
  RESET_RACE(state) {
    state.results = [];
    state.currentRound = 0;
    state.isRacing = false;
    state.isPaused = false;
    state.currentPositions = {};
  }
};

const actions = {
  generateSchedule({ commit, rootState }) {
    const allHorses = rootState.horses.allHorses;
    const schedule = [];

    for (let round = 0; round < TOTAL_ROUNDS; round++) {
      const availableIndices = Array.from({ length: TOTAL_HORSES }, (_, i) => i);
      const selectedIndices = shuffleArray(availableIndices).slice(
        0,
        HORSES_PER_RACE
      );
      const selectedHorses = selectedIndices.map(i => allHorses[i]);

      schedule.push({
        round: round + 1,
        distance: RACE_DISTANCES[round],
        horses: selectedHorses
      });
    }

    commit('SET_SCHEDULE', schedule);
  },

  async startRace({ commit, state, dispatch }) {
    if (state.isRacing) return;
    
    if (state.schedule.length === 0) return;

    orchestrator = new RaceOrchestrator();

    commit('SET_RACING', true);
    commit('SET_PAUSED', false);

    try {
      for (let round = 1; round <= TOTAL_ROUNDS; round++) {
        commit('SET_CURRENT_ROUND', round);
        await dispatch('runRound', round);

        while (state.isPaused) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error('Race error:', error);
      // Cleanup on error
      if (orchestrator) {
        orchestrator.cleanup();
      }
    } finally {
      try {
        commit('SET_RACING', false);
        commit('SET_CURRENT_ROUND', 0);
        
        if (orchestrator) {
          orchestrator.cleanup();
          orchestrator = null;
        }
      } catch (cleanupError) {
        console.warn('Race state cleanup failed:', cleanupError);
      }
    }
  },

  async runRound({ commit, state }) {
    const roundData = state.schedule[state.currentRound - 1];
    if (!roundData) return;

    commit('RESET_POSITIONS');

    const results = await orchestrator.runRound(
      roundData.horses,
      roundData.distance,
      (horseId, position) => {
        commit('UPDATE_POSITION', { horseId, position });
      }
    );

    const sortedResults = results.sort((a, b) => a.position - b.position);

    commit('ADD_RESULT', {
      round: roundData.round,
      distance: roundData.distance,
      results: sortedResults.map(horse => ({
        position: horse.position,
        horse
      }))
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
  },

  pauseRace({ commit }) {
    commit('SET_PAUSED', true);
    if (orchestrator) {
      orchestrator.pause();
    }
  },

  resumeRace({ commit }) {
    commit('SET_PAUSED', false);
    if (orchestrator) {
      orchestrator.resume();
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};