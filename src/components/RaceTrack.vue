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
              :class="{ 
                paused: isPaused,
                finished: isHorseFinished(horse.id)
              }"
              :style="{
                left: (positions[horse.id] + 'px') || '0px'
              }"
            >
              <svg class="horse-svg" viewBox="0 0 445 357" xmlns="http://www.w3.org/2000/svg">
                <g class="horse-body">
                  <path :fill="horse.color" stroke="#000" stroke-width="1.5" d="M55.522,245.23l-0.8,24.707l30.834-11.999l6.841-6.662l12.707-11.287l10.574-6.841l7.464-6.041l10.308-7.733l11.818-10.482l11.728-12.44l2.222-0.712l3.021,1.333l15.018,6.841l16.528,5.954l20.97,5.954l25.591,7.554l12.617,2.221h12.798l11.283-1.508l15.02-2.934l9.504-3.287l0.271,2.842l3.82,2.666l14.928,11.995l13.148,7.107l19.195,9.688l14.839-4.175l-4.265-8l-16.616-24.877l-5.333-7.554l-1.42-2.579v-1.774l13.505-24.169l0.8-5.155l-0.8-8.264l-2.224-9.774v-3.734v-3.02l8.267-21.682l11.107-32.343l3.731-11.285l0.977-1.6l1.601,0.711l4.799,1.599l6.219,0.801l10.04-0.979l2.758,1.156l3.729,0.623l12.531,3.108l2.307,3.379l3.2,3.197l2.667,1.333l1.508-0.179l2.757-0.798l3.91-2.046l6.487-2.043l0.71-2.31l1.864-0.177l1.512-2.753l0.444-4.533v-2.311l-0.71-3.641l-0.268-4l-1.245-3.467l-3.82-2.397l-4.709-2.221l-15.194-13.774l-7.107-7.374l-0.266-3.645l-1.957-2.133l-4.177-2.221l-10.219-7.287l-7.553-4.977l0.8-1.42l5.243-7.554l2.22-4.443V4.783l-1.42-0.71l-3.733,3.021l-3.908,3.823l-5.245,2.221l1.601-5.331l0.712-5.244l-1.42-2.311h-3.113l-3.021,3.821l-4.533,6.043l-4.264,3.73l-3.021,3.733l-3.023,4.531L300.147,80.49l-46.384,27.279l-16.528,2.311l-27.013-0.798l-20.97-3.023l-11.996-2.931l-11.285-3.733l-6.842-1.6l-12.618,0.713l-13.506,3.108l-16.616,6.754l-13.507,8.264l-12.708,10.574l-5.33,7.464l-4.532,11.998l-1.421,7.464v8.352l0.711,16.352l1.421,17.235l2.31,16.616v8.266l-0.8,3.733l-3.643,6.041l-3.109,3.733l-4.444,2.929l-8.264,3.82l-6.842,2.313L55.522,245.23z"/>
                  
                  <g class="legs front-legs">
                    <path :fill="horse.color" stroke="#000" stroke-width="1.5" d="M288.595,266.912l0.534-4.354l1.777-11.549l1.953-13.42l7.552-25.411l-34.651,9.596l1.864,23.281l1.51,13.861l0.446,19.369l-0.889,8.354l8.796,1.954L288.595,266.912z"/>
                  </g>
                  
                  <g class="legs back-legs">
                    <path :fill="horse.color" stroke="#000" stroke-width="1.5" d="M121.81,222.754l2.489,8.707v9.508l-1.245,9.508l-3.999,9.508l-1.155,6.308l0.357,4.887l32.609,11.195l-5.242-13.328l-0.889-6.309l1.954-5.6l5.155-12.174l3.909-9.508l2.756-7.549l3.287-14.661l0.355-26.215L121.81,222.754z"/>
                  </g>
                  
                  <path fill="#000" d="M433.256,71.515l-3.288-0.176l-1.333,1.154l-0.267,1.423l-0.266,1.423l1.865,3.198l1.067,1.244l0.888,0.446l0.8,0.264l1.42-0.264l0.89-2.31v-1.69l-0.443-1.6l-0.712-1.244l-2.842-0.354l0.707-0.89L433.256,71.515z"/>
                </g>
              </svg>
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
import { TRACK_LENGTH } from '@/constants';

export default {
  name: 'RaceTrack',
  setup() {
    const store = useStore();

    // Race state
    const isRacing = computed(() => store.state.race.isRacing);
    const isPaused = computed(() => store.state.race.isPaused);
    const currentRound = computed(() => store.state.race.currentRound);
    
    // Current round data
    const currentRoundData = computed(
      () => store.getters['race/getCurrentRoundData']
    );
    const currentHorses = computed(() => currentRoundData.value?.horses || []);
    const currentDistance = computed(() => currentRoundData.value?.distance || 0);
    
    // Animation positions
    const positions = computed(() => store.state.race.currentPositions);

    // Check if horse has finished (reached the end of track)
    const isHorseFinished = (horseId) => {
      const position = positions.value[horseId] || 0;
      return position >= TRACK_LENGTH;
    };

    return {
      isRacing,
      isPaused,
      currentRound,
      currentHorses,
      currentDistance,
      positions,
      isHorseFinished
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
  width: 60px;
  height: 45px;
  will-change: left;
}

.horse-runner.paused * {
  animation-play-state: paused !important;
}

/* Stop animations when horse finishes */
.horse-runner.finished .horse-body,
.horse-runner.finished .legs {
  animation: none !important;
}

.horse-svg {
  width: 100%;
  height: 100%;
}

.horse-body {
  animation: bounce 0.2s ease-in-out infinite;
  transform-origin: center bottom;
}

.legs {
  animation: gallop 0.2s ease-in-out infinite;
  transform-origin: top center;
}

.front-legs {
  animation-delay: 0s;
}

.back-legs {
  animation-delay: 0.1s;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes gallop {
  0%, 100% {
    transform: rotate(-15deg);
  }
  50% {
    transform: rotate(15deg);
  }
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