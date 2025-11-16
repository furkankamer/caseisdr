<template>
  <div class="horse-list">
    <h3 class="panel-title">Horse List (1-20)</h3>
    <table class="horse-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Condition</th>
          <th>Color</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="horse in horses" :key="horse.id">
          <td>{{ horse.name }}</td>
          <td>{{ horse.condition }}</td>
          <td>
            <span
              class="color-box"
              :style="{ backgroundColor: horse.color }"
            ></span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'HorseList',
  setup() {
    const store = useStore();
    const horses = computed(() => store.getters['horses/getAllHorses']);

    return {
      horses
    };
  }
};
</script>

<style scoped>
.horse-list {
  padding: 1rem;
}

.panel-title {
  background: #e0e0e0;
  padding: 0.5rem;
  margin: -1rem -1rem 1rem -1rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-bottom: 2px solid #999;
}

.horse-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.horse-table th {
  background: #ddd;
  padding: 0.5rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #999;
}

.horse-table td {
  padding: 0.5rem;
  border-bottom: 1px solid #ddd;
}

.horse-table tr:hover {
  background: #f9f9f9;
}

.color-box {
  display: inline-block;
  width: 30px;
  height: 20px;
  border: 1px solid #333;
  border-radius: 3px;
}
</style>