import { HORSE_NAMES, HORSE_COLORS, TOTAL_HORSES } from '@/constants';

const generateCondition = () => Math.floor(Math.random() * 100) + 1;


const generateHorses = () => {
  return Array.from({ length: TOTAL_HORSES }, (_, index) => ({
    id: index + 1,
    name: HORSE_NAMES[index],
    color: HORSE_COLORS[index],
    condition: generateCondition()
  }));
};

const state = {
  allHorses: generateHorses()
};

const getters = {
  getAllHorses: state => state.allHorses,
  getHorseById: state => id => {
    return state.allHorses.find(horse => horse.id === id);
  }
};

const mutations = {
  UPDATE_HORSE_CONDITION(state, { id, condition }) {
    const horse = state.allHorses.find(h => h.id === id);
    if (horse) {
      horse.condition = condition;
    }
  },
  REGENERATE_HORSES(state) {
    state.allHorses = generateHorses();
  }
};

const actions = {
  updateHorseCondition({ commit }, payload) {
    commit('UPDATE_HORSE_CONDITION', payload);
  },
  regenerateHorses({ commit }) {
    commit('REGENERATE_HORSES');
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};