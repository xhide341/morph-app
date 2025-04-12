import { Howl } from "howler";

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

export const playSound = (sound: "start" | "pause" | "reset" | "complete") => {
  sounds[sound].play();
};

export const stopSound = (sound: "start" | "pause" | "reset" | "complete") => {
  sounds[sound].stop();
};

export const setVolume = (volume: number) => {
  Object.values(sounds).forEach((sound) => {
    sound.volume(volume);
  });
};
