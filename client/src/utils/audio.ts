// Collection of sound effects
const sounds = {
  start: new Audio("/sounds/start.mp3"),
  pause: new Audio("/sounds/pause.mp3"),
  reset: new Audio("/sounds/stop.mp3"),
  complete: new Audio("/sounds/ring.mp3"),
};

// Audio player with volume control
export const playSound = (sound: "start" | "pause" | "reset" | "complete", volume = 0.5) => {
  const audio = sounds[sound];

  // Set volume (0-1)
  audio.volume = volume;

  // Stop and reset if already playing
  audio.pause();
  audio.currentTime = 0;

  // Play the sound
  audio.play().catch((err) => {
    // Handle autoplay policy errors
    console.log(`Audio play failed: ${err}`);
  });
};
