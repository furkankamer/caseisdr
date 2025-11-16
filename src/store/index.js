import { createStore } from 'vuex';
import horses from './modules/horses';
import race from './modules/race';

export default createStore({
  modules: {
    horses,
    race
  }
});