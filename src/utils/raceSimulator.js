import { TRACK_LENGTH } from '@/constants';

/**
 * Calculate race duration based on distance and horse condition
 * Uses clamped speed range to ensure realistic race times
 */
export function calculateRaceDuration(distance, condition) {
  const baseSpeed = 200; // m/s at perfect condition
  const minSpeedMultiplier = 0.6; // Worst case: 60% of base speed
  const maxSpeedMultiplier = 1.0; // Best case: 100% of base speed
  
  // Linear interpolation between min and max speed based on condition
  const speedMultiplier = minSpeedMultiplier + 
    (maxSpeedMultiplier - minSpeedMultiplier) * (condition / 100);
  
  const actualSpeed = baseSpeed * speedMultiplier;
  
  // Random factor: ±5% variance (more realistic than ±10%)
  const randomFactor = 0.95 + Math.random() * 0.1;

  return (distance / actualSpeed) * randomFactor * 1000; // convert to ms
}

/**
 * Animate a single horse across the track
 */
export function animateHorse(horse, duration, onUpdate, onComplete) {
  const startTime = performance.now();
  let animationFrame;
  let isPaused = false;
  let pausedTime = 0;
  let totalPausedDuration = 0;

  function update(currentTime) {
    if (isPaused) {
      animationFrame = requestAnimationFrame(update);
      return;
    }

    const elapsed = currentTime - startTime - totalPausedDuration;
    const progress = Math.min(elapsed / duration, 1);
    const position = progress * TRACK_LENGTH;

    onUpdate(horse.id, position);

    if (progress < 1) {
      animationFrame = requestAnimationFrame(update);
    } else {
      onComplete(horse);
    }
  }

  animationFrame = requestAnimationFrame(update);

  return {
    pause() {
      if (!isPaused) {
        isPaused = true;
        pausedTime = performance.now();
      }
    },
    resume() {
      if (isPaused) {
        totalPausedDuration += performance.now() - pausedTime;
        isPaused = false;
      }
    },
    cancel() {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    }
  };
}

/**
 * Simulate entire race with all horses
 * Returns promise with results and animation controllers
 */
export function simulateRace(horses, distance, onUpdate) {
  const controllers = [];
  
  const racePromise = new Promise(resolve => {
    const results = [];
    let finishedCount = 0;

    horses.forEach(horse => {
      const duration = calculateRaceDuration(distance, horse.condition);

      const controller = animateHorse(
        horse,
        duration,
        (horseId, position) => {
          onUpdate(horseId, position);
        },
        finishedHorse => {
          finishedCount++;
          results.push({
            ...finishedHorse,
            position: finishedCount,
            finishTime: duration
          });

          if (finishedCount === horses.length) {
            resolve(results);
          }
        }
      );
      
      controllers.push(controller);
    });
  });

  // Attach controllers to promise
  racePromise.controllers = controllers;
  return racePromise;
}