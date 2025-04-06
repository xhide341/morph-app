import { Howl } from "howler";

// Create sound instances
const sounds = {
  start: new Howl({
    src: ["/sounds/start.mp3"],
    volume: 0.5,
    preload: true,
  }),
  pause: new Howl({
    src: ["/sounds/pause.mp3"],
    volume: 0.5,
    preload: true,
  }),
  reset: new Howl({
    src: ["/sounds/reset.mp3"],
    volume: 0.5,
    preload: true,
  }),
  complete: new Howl({
    src: ["/sounds/ring.mp3"],
    volume: 0.7,
    preload: true,
  }),
};

// Simple play function
export const playSound = (sound: "start" | "pause" | "reset" | "complete") => {
  sounds[sound].play();
};

// Stop a specific sound
export const stopSound = (sound: "start" | "pause" | "reset" | "complete") => {
  sounds[sound].stop();
};

// Set volume for all sounds
export const setVolume = (volume: number) => {
  Object.values(sounds).forEach((sound) => {
    sound.volume(volume);
  });
};
