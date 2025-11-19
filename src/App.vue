<template>
  <div id="app">
    <header class="header">
      <h1>Horse Racing</h1>
      <div class="controls">
        <button @click="generateProgram" class="btn btn-primary">
          GENERATE PROGRAM
        </button>
        <button @click="toggleRace" class="btn btn-secondary" :disabled="!hasProgram">
          {{ raceButtonText }}
        </button>
      </div>
    </header>

    <main class="main-layout">
      <aside class="left-panel">
        <HorseList />
      </aside>

      <section class="center-panel">
        <RaceTrack />
      </section>

      <aside class="right-panel">
        <div class="tabs">
          <button 
            @click="activeTab = 'program'" 
            :class="{ active: activeTab === 'program' }"
          >
            Program
          </button>
          <button 
            @click="activeTab = 'results'" 
            :class="{ active: activeTab === 'results' }"
          >
            Results
          </button>
        </div>
        <ProgramPanel v-if="activeTab === 'program'" />
        <ResultsPanel v-else />
      </aside>
    </main>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import HorseList from './components/HorseList.vue';
import RaceTrack from './components/RaceTrack.vue';
import ProgramPanel from './components/ProgramPanel.vue';
import ResultsPanel from './components/ResultsPanel.vue';

export default {
  name: 'App',
  components: {
    HorseList,
    RaceTrack,
    ProgramPanel,
    ResultsPanel
  },
  setup() {
    const store = useStore();
    const activeTab = ref('program');

    const hasProgram = computed(() => store.state.race.schedule.length > 0);
    const isRacing = computed(() => store.state.race.isRacing);
    const isPaused = computed(() => store.state.race.isPaused);

    const raceButtonText = computed(() => {
      if (!isRacing.value) return 'START';
      if (isPaused.value) return 'START'; 
      return 'PAUSE';
    });

    const generateProgram = async () => {
      if (isRacing.value) {
        await store.dispatch('race/cancelRace');
      }
      
      store.dispatch('race/generateSchedule');
      activeTab.value = 'program'; // Programı göster
    };

    const toggleRace = () => {
      if (!isRacing.value) {
        store.dispatch('race/startRace');
        activeTab.value = 'results';
      } else if (isPaused.value) {
        store.dispatch('race/resumeRace');
      } else {
        store.dispatch('race/pauseRace');
      }
    };

    return {
      activeTab,
      hasProgram,
      raceButtonText,
      generateProgram,
      toggleRace
    };
  }
};
</script>

<style scoped>
.header {
  background: #d4a5a5;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #999;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.controls {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: white;
  color: #333;
}

.btn-secondary {
  background: #8b4513;
  color: white;
}

.main-layout {
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  height: calc(100vh - 70px);
}

.left-panel,
.right-panel {
  background: #f5f5f5;
  overflow-y: auto;
}

.center-panel {
  background: #e8e8e8;
  border-left: 2px solid #999;
  border-right: 2px solid #999;
}

.tabs {
  display: flex;
  background: #ddd;
}

.tabs button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  border-bottom: 3px solid transparent;
}

.tabs button.active {
  background: #89cff0;
  border-bottom-color: #4a90e2;
}
</style>