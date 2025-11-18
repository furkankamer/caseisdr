import { describe, it, expect, beforeEach, vi } from 'vitest';
import horsesModule from '../horses';
import { TOTAL_HORSES } from '@/constants';

describe('Horses Store Module', () => {
  let state;

  beforeEach(() => {
    state = JSON.parse(JSON.stringify(horsesModule.state));
  });

  describe('initial state', () => {
    it('should have exactly 20 horses', () => {
      expect(state.allHorses).toHaveLength(TOTAL_HORSES);
    });

    it('should have unique IDs for all horses', () => {
      const ids = state.allHorses.map(h => h.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(TOTAL_HORSES);
    });

    it('should have unique colors for all horses', () => {
      const colors = state.allHorses.map(h => h.color);
      const uniqueColors = new Set(colors);

      expect(uniqueColors.size).toBe(TOTAL_HORSES);
    });

    it('should have condition between 1-100 for all horses', () => {
      state.allHorses.forEach(horse => {
        expect(horse.condition).toBeGreaterThanOrEqual(1);
        expect(horse.condition).toBeLessThanOrEqual(100);
      });
    });

    it('should have valid names for all horses', () => {
      state.allHorses.forEach(horse => {
        expect(horse.name).toBeTruthy();
        expect(typeof horse.name).toBe('string');
        expect(horse.name.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getters', () => {
    it('getAllHorses should return all horses', () => {
      const result = horsesModule.getters.getAllHorses(state);

      expect(result).toEqual(state.allHorses);
      expect(result).toHaveLength(TOTAL_HORSES);
    });

    it('getHorseById should return correct horse', () => {
      const targetId = 5;
      const result = horsesModule.getters.getHorseById(state)(targetId);

      expect(result).toBeDefined();
      expect(result.id).toBe(targetId);
    });

    it('getHorseById should return undefined for non-existent ID', () => {
      const result = horsesModule.getters.getHorseById(state)(999);

      expect(result).toBeUndefined();
    });
  });

  describe('mutations', () => {
    it('UPDATE_HORSE_CONDITION should update horse condition', () => {
      const targetId = 3;
      const newCondition = 75;

      horsesModule.mutations.UPDATE_HORSE_CONDITION(state, {
        id: targetId,
        condition: newCondition
      });

      const updatedHorse = state.allHorses.find(h => h.id === targetId);
      expect(updatedHorse.condition).toBe(newCondition);
    });

    it('UPDATE_HORSE_CONDITION should not affect other horses', () => {
      const targetId = 3;
      const originalHorses = JSON.parse(JSON.stringify(state.allHorses));

      horsesModule.mutations.UPDATE_HORSE_CONDITION(state, {
        id: targetId,
        condition: 75
      });

      state.allHorses.forEach((horse, index) => {
        if (horse.id !== targetId) {
          expect(horse.condition).toBe(originalHorses[index].condition);
        }
      });
    });

    it('REGENERATE_HORSES should create new horses', () => {
      const originalIds = state.allHorses.map(h => h.id);

      horsesModule.mutations.REGENERATE_HORSES(state);

      expect(state.allHorses).toHaveLength(TOTAL_HORSES);

      const newIds = state.allHorses.map(h => h.id);
      expect(newIds).toEqual(originalIds);

      const originalConditions = originalIds.map(
        id => horsesModule.state.allHorses.find(h => h.id === id).condition
      );
      const newConditions = state.allHorses.map(h => h.condition);

      const differentCount = newConditions.filter(
        (c, i) => c !== originalConditions[i]
      ).length;

      expect(differentCount).toBeGreaterThan(10);
    });
  });

  describe('actions', () => {
    it('updateHorseCondition should commit UPDATE_HORSE_CONDITION', () => {
      const commit = vi.fn();
      const payload = { id: 5, condition: 80 };

      horsesModule.actions.updateHorseCondition({ commit }, payload);

      expect(commit).toHaveBeenCalledWith('UPDATE_HORSE_CONDITION', payload);
    });

    it('regenerateHorses should commit REGENERATE_HORSES', () => {
      const commit = vi.fn();

      horsesModule.actions.regenerateHorses({ commit });

      expect(commit).toHaveBeenCalledWith('REGENERATE_HORSES');
    });
  });
});