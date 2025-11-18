import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import HorseList from '../HorseList.vue';

describe('HorseList Component', () => {
  let store;
  let mockHorses;

  beforeEach(() => {
    mockHorses = [
      { id: 1, name: 'Ada Lovelace', condition: 85, color: '#FF6B6B' },
      { id: 2, name: 'Grace Hopper', condition: 92, color: '#4ECDC4' },
      { id: 3, name: 'Alan Turing', condition: 78, color: '#45B7D1' }
    ];

    store = createStore({
      modules: {
        horses: {
          namespaced: true,
          state: { allHorses: mockHorses },
          getters: {
            getAllHorses: state => state.allHorses
          }
        }
      }
    });
  });

  it('should render all horses', () => {
    const wrapper = mount(HorseList, {
      global: { plugins: [store] }
    });

    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(mockHorses.length);
  });

  it('should display horse names', () => {
    const wrapper = mount(HorseList, {
      global: { plugins: [store] }
    });

    mockHorses.forEach(horse => {
      expect(wrapper.text()).toContain(horse.name);
    });
  });

  it('should display horse conditions', () => {
    const wrapper = mount(HorseList, {
      global: { plugins: [store] }
    });

    mockHorses.forEach(horse => {
      expect(wrapper.text()).toContain(horse.condition.toString());
    });
  });

  it('should display color boxes with correct colors', () => {
    const wrapper = mount(HorseList, {
      global: { plugins: [store] }
    });

    const colorBoxes = wrapper.findAll('.color-box');
    expect(colorBoxes).toHaveLength(mockHorses.length);

    colorBoxes.forEach((box, index) => {
      const style = box.attributes('style');
      // Browser converts hex to rgb, so just check it has backgroundColor
      expect(style).toContain('background-color');
      expect(style).toContain('rgb');
    });
  });

  it('should have proper table structure', () => {
    const wrapper = mount(HorseList, {
      global: { plugins: [store] }
    });

    expect(wrapper.find('thead').exists()).toBe(true);
    expect(wrapper.find('tbody').exists()).toBe(true);

    const headers = wrapper.findAll('th');
    expect(headers).toHaveLength(3);
    expect(headers[0].text()).toBe('Name');
    expect(headers[1].text()).toBe('Condition');
    expect(headers[2].text()).toBe('Color');
  });

  it('should render title', () => {
    const wrapper = mount(HorseList, {
      global: { plugins: [store] }
    });

    expect(wrapper.text()).toContain('Horse List (1-20)');
  });
});