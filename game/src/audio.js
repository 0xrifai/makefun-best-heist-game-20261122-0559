// audio.js — tiny WebAudio bleeps, generated in code, no sound files at all.
// Everything is optional: the game starts silent until the first key press
// (browsers block audio before interaction), and M toggles mute.

export function makeAudio() {
  return { ctx: null, muted: false, alarmOsc: null, alarmGain: null };
}

function ensureCtx(audio) {
  if (audio.ctx) return audio.ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  audio.ctx = new AC();
  return audio.ctx;
}

function blip(audio, freq, seconds, type, volume) {
  if (audio.muted) return;
  const ctx = ensureCtx(audio);
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume || 0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + seconds);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + seconds);
}

export function sfxPickup(audio) {
  blip(audio, 880, 0.12, 'sine', 0.09);
  setTimeout(() => blip(audio, 1320, 0.14, 'sine', 0.07), 70);
}

export function sfxSpotted(audio) {
  blip(audio, 220, 0.25, 'square', 0.05);
}

export function sfxCaught(audio) {
  blip(audio, 160, 0.5, 'sawtooth', 0.09);
  setTimeout(() => blip(audio, 110, 0.6, 'sawtooth', 0.09), 160);
}

export function sfxWin(audio) {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(audio, f, 0.22, 'triangle', 0.09), i * 120));
}

export function sfxTool(audio) {
  blip(audio, 440, 0.15, 'triangle', 0.07);
  setTimeout(() => blip(audio, 330, 0.2, 'triangle', 0.06), 90);
}

export function sfxClick(audio) {
  blip(audio, 660, 0.06, 'sine', 0.05);
}

// A soft pulsing alarm tone while the meter is high; call every frame, it
// starts and stops the loop itself.
export function alarmTone(audio, value) {
  if (audio.muted || value < 55) {
    stopAlarmTone(audio);
    return;
  }
  const ctx = ensureCtx(audio);
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  if (!audio.alarmOsc) {
    audio.alarmOsc = ctx.createOscillator();
    audio.alarmGain = ctx.createGain();
    audio.alarmOsc.type = 'sine';
    audio.alarmOsc.frequency.value = 620;
    audio.alarmGain.gain.value = 0.0;
    audio.alarmOsc.connect(audio.alarmGain);
    audio.alarmGain.connect(ctx.destination);
    audio.alarmOsc.start();
  }
  const target = value >= 85 ? 0.035 : 0.018;
  audio.alarmGain.gain.setTargetAtTime(target, ctx.currentTime, 0.1);
  audio.alarmOsc.frequency.setTargetAtTime(520 + value * 2, ctx.currentTime, 0.1);
}

export function stopAlarmTone(audio) {
  if (audio.alarmOsc) {
    try {
      audio.alarmOsc.stop();
    } catch (e) {
      /* already stopped */
    }
    audio.alarmOsc = null;
    audio.alarmGain = null;
  }
}

export function toggleMute(audio) {
  audio.muted = !audio.muted;
  if (audio.muted) stopAlarmTone(audio);
  return audio.muted;
}
