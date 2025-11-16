<template>
  <div class="race-track">
    <div v-if="!isRacing" class="empty-state">
      <p>Generate a program and click START to begin racing</p>
    </div>
    <div v-else class="track-container">
      <div class="track-info">
        <h3>Round {{ currentRound }} - {{ currentDistance }}m</h3>
      </div>
      
      <div class="lanes">
        <div
          v-for="(horse, index) in currentHorses"
          :key="horse.id"
          class="lane"
        >
          <div class="lane-number">{{ index + 1 }}</div>
          <div class="lane-track">
            <div
              class="horse-runner"
              :style="{
                backgroundColor: horse.color,
                left: positions[horse.id] || '0px'
              }"
            >
              🐴
            </div>
          </div>
        </div>
      </div>

      <div class="finish-line">FINISH</div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'RaceTrack',
  setup() {
    const store = useStore();

    const isRacing = computed(() => store.state.race.isRacing);
    const currentRound = computed(() => store.state.race.currentRound);
    const currentRoundData = computed(
      () => store.getters['race/getCurrentRoundData']
    );
    const currentHorses = computed(() => currentRoundData.value?.horses || []);
    const currentDistance = computed(() => currentRoundData.value?.distance || 0);
    const positions = computed(() => store.state.race.currentPositions);

    return {
      isRacing,
      currentRound,
      currentHorses,
      currentDistance,
      positions
    };
  }
};
</script>

<style scoped>
.race-track {
  height: 100%;
  padding: 1rem;
  position: relative;
  background: #f5f5dc;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 1.1rem;
}

.track-info {
  text-align: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
}

.lanes {
  border: 2px solid #8b4513;
  background: white;
  padding: 1rem;
  border-radius: 8px;
}

.lane {
  display: flex;
  align-items: center;
  height: 60px;
  border-bottom: 2px dashed #ccc;
  position: relative;
}

.lane:last-child {
  border-bottom: none;
}

.lane-number {
  width: 40px;
  text-align: center;
  font-weight: bold;
  font-size: 1.2rem;
  color: #666;
}

.lane-track {
  flex: 1;
  position: relative;
  height: 100%;
}

.horse-runner {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border-radius: 50%;
  transition: left 0.1s linear;
  border: 2px solid #333;
}

.finish-line {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  writing-mode: vertical-rl;
  font-weight: bold;
  color: #d32f2f;
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem;
  border: 2px solid #d32f2f;
}
</style>