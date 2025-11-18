
import { simulateRace } from '@/utils/raceSimulator';

export class RaceOrchestrator {
  constructor() {
    this.animationControllers = [];
    this.isPaused = false;
    this.onPositionUpdate = null;
  }

  /**
   * Runs a single round of the race
   * @param {Array} horses - Horses participating in this round
   * @param {number} distance - Race distance in meters
   * @param {Function} onPositionUpdate - Callback for position updates (horseId, position)
   * @returns {Promise<Array>} Race results
   */
  async runRound(horses, distance, onPositionUpdate) {
    this.onPositionUpdate = onPositionUpdate;
    
    this.cleanup();

    const racePromise = simulateRace(
      horses,
      distance,
      (horseId, position) => {
        if (this.onPositionUpdate) {
          this.onPositionUpdate(horseId, position);
        }
      }
    );

    this.animationControllers = racePromise.controllers;

    try {
      const results = await racePromise;
      return results;
    } finally {
      this.cleanup();
    }
  }

  pause() {
    this.isPaused = true;
    this.animationControllers.forEach(controller => {
      if (controller && controller.pause) {
        controller.pause();
      }
    });
  }

  resume() {
    this.isPaused = false;
    this.animationControllers.forEach(controller => {
      if (controller && controller.resume) {
        controller.resume();
      }
    });
  }

  cleanup() {
    this.animationControllers.forEach(controller => {
      if (controller && controller.cancel) {
        controller.cancel();
      }
    });
    this.animationControllers = [];
  }

  isActive() {
    return this.animationControllers.length > 0;
  }
}