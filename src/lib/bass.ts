let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

/** Play a single short bass thump. Safe to call from click handlers. */
export function playBassTone(frequency = 55.0, duration = 0.5) {
  const ctx = getAudioContext();

  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(150, now);
  filter.Q.setValueAtTime(10, now);

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.95, now + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration - 0.025);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}
