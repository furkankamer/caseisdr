<template>
  <div class="results-panel">
    <div v-if="results.length === 0" class="empty-state">
      <p>No results yet</p>
      <p class="hint">Results will appear here after each race</p>
    </div>
    <div v-else class="results">
      <div
        v-for="result in results"
        :key="result.round"
        class="result-card"
      >
        <div class="result-header">
          {{ getOrdinal(result.round) }} Lap - {{ result.distance }}m
        </div>
        <table class="results-table">
          <thead>
            <tr>
              <th>Position</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in result.results" :key="item.horse.id">
              <td class="position">{{ item.position }}</td>
              <td>
                <span
                  class="color-indicator"
                  :style="{ backgroundColor: item.horse.color }"
                ></span>
                {{ item.horse.name }}
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
import { getOrdinal } from '@/utils/formatters';

export default {
  name: 'ResultsPanel',
  setup() {
    const store = useStore();

    const results = computed(() => store.state.race.results);

    return {
      results,
      getOrdinal
    };
  }
};
</script>

<style scoped>
.results-panel {
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

.result-card {
  background: white;
  border-radius: 4px;
  margin-bottom: 1rem;
  overflow: hidden;
  border: 2px solid #4caf50;
}

.result-header {
  background: #ff9999;
  padding: 0.5rem 1rem;
  font-weight: 600;
  color: #333;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.results-table th {
  background: #f5f5f5;
  padding: 0.5rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid #ddd;
}

.results-table td {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.position {
  font-weight: bold;
  color: #4caf50;
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