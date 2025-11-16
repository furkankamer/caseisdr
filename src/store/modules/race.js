import {
  RACE_DISTANCES,
  HORSES_PER_RACE,
  TOTAL_ROUNDS,
  TOTAL_HORSES
} from '@/constants';

// Fisher-Yates shuffle for random selection
const shuffleArray = array => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

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
    state.schedule = [];
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
      // Select 10 random horses
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
    commit('RESET_RACE');
  },

  async startRace({ commit, state, dispatch }) {
    if (state.schedule.length === 0) return;

    commit('SET_RACING', true);
    commit('SET_PAUSED', false);

    for (let round = 1; round <= TOTAL_ROUNDS; round++) {
      commit('SET_CURRENT_ROUND', round);
      await dispatch('runRound', round);

      // Wait for pause/resume if paused
      while (state.isPaused) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    commit('SET_RACING', false);
    commit('SET_CURRENT_ROUND', 0);
  },

  async runRound({ commit, state }) {
    const roundData = state.schedule[state.currentRound - 1];
    if (!roundData) return;

    commit('RESET_POSITIONS');

    // Simulate race (placeholder - will be implemented with animation)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Calculate results (simplified for now)
    const results = roundData.horses
      .map(horse => ({
        ...horse,
        finishTime: Math.random() * 10 + (100 - horse.condition) * 0.1
      }))
      .sort((a, b) => a.finishTime - b.finishTime);

    commit('ADD_RESULT', {
      round: roundData.round,
      distance: roundData.distance,
      results: results.map((horse, index) => ({
        position: index + 1,
        horse
      }))
    });
  },

  pauseRace({ commit }) {
    commit('SET_PAUSED', true);
  },

  resumeRace({ commit }) {
    commit('SET_PAUSED', false);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};