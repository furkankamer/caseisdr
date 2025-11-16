<template>
  <div class="program-panel">
    <div v-if="schedule.length === 0" class="empty-state">
      <p>No program generated yet</p>
      <p class="hint">Click "GENERATE PROGRAM" to create race schedule</p>
    </div>
    <div v-else class="rounds">
      <div
        v-for="round in schedule"
        :key="round.round"
        class="round-card"
        :class="{ active: round.round === currentRound }"
      >
        <div class="round-header">
          {{ getOrdinal(round.round) }} Lap - {{ round.distance }}m
        </div>
        <table class="horses-table">
          <thead>
            <tr>
              <th>Position</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(horse, index) in round.horses" :key="horse.id">
              <td>{{ index + 1 }}</td>
              <td>
                <span
                  class="color-indicator"
                  :style="{ backgroundColor: horse.color }"
                ></span>
                {{ horse.name }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'ProgramPanel',
  setup() {
    const store = useStore();

    const schedule = computed(() => store.state.race.schedule);
    const currentRound = computed(() => store.state.race.currentRound);

    const getOrdinal = num => {
      const suffixes = ['th', 'st', 'nd', 'rd'];
      const v = num % 100;
      return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
    };

    return {
      schedule,
      currentRound,
      getOrdinal
    };
  }
};
</script>

<style scoped>
.program-panel {
  padding: 1rem;
  height: calc(100vh - 140px);
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.hint {
  font-size: 0.9rem;
  margin-top: 0.5rem;
  color: #999;
}

.round-card {
  background: white;
  border-radius: 4px;
  margin-bottom: 1rem;
  overflow: hidden;
  border: 2px solid #ddd;
}

.round-card.active {
  border-color: #4a90e2;
  box-shadow: 0 0 10px rgba(74, 144, 226, 0.3);
}

.round-header {
  background: #ff9999;
  padding: 0.5rem 1rem;
  font-weight: 600;
  color: #333;
}

.round-card.active .round-header {
  background: #4a90e2;
  color: white;
}

.horses-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.horses-table th {
  background: #f5f5f5;
  padding: 0.5rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid #ddd;
}

.horses-table td {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.color-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 0.5rem;
  border: 1px solid #333;
}
</style>