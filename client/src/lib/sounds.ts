let audioContext: AudioContext | null = null;
let isUnlocked = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }
  }
  return audioContext;
}

function unlockAudioContext() {
  const ctx = getAudioContext();
  if (!ctx || isUnlocked) return;
  
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  const buffer = ctx.createBuffer(1, 1, 22050);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
  
  isUnlocked = true;
}

if (typeof window !== 'undefined') {
  ['touchstart', 'touchend', 'mousedown', 'click'].forEach(event => {
    document.addEventListener(event, unlockAudioContext, { once: true, passive: true });
  });
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.15) {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

// C chromatic major scale frequencies (C4 to C5, all semitones)
const C_CHROMATIC_SCALE = [
  261.63, // C4
  277.18, // C#4
  293.66, // D4
  311.13, // D#4
  329.63, // E4
  349.23, // F4
  369.99, // F#4
  392.00, // G4
  415.30, // G#4
  440.00, // A4
  466.16, // A#4
  493.88, // B4
  523.25, // C5
];

// Track current position in the scale
let scalePosition = 0;

export function playSelectSound() {
  const frequency = C_CHROMATIC_SCALE[scalePosition];
  playTone(frequency, 0.12, 'sine', 0.15);
  
  // Move up the scale, but cap at the highest note
  if (scalePosition < C_CHROMATIC_SCALE.length - 1) {
    scalePosition++;
  }
}

export function playDeselectSound() {
  // Move down the scale first, then play
  if (scalePosition > 0) {
    scalePosition--;
  }
  
  const frequency = C_CHROMATIC_SCALE[scalePosition];
  playTone(frequency, 0.1, 'sine', 0.12);
}

export function resetScalePosition() {
  scalePosition = 0;
}

export function playIntroSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  // Play a quick ascending arpeggio (C major chord)
  const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
  notes.forEach((freq, i) => {
    setTimeout(() => {
      playTone(freq, 0.15, 'sine', 0.12);
    }, i * 60);
  });
}

export function playSuccessSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  const notes = [523, 659, 784];
  notes.forEach((freq, i) => {
    setTimeout(() => {
      playTone(freq, 0.15, 'sine', 0.15);
    }, i * 80);
  });
}

export function playResetSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  // Descending "whoosh" effect followed by rising confirmation
  const descendNotes = [784, 659, 523, 392];
  const ascendNotes = [523, 784];
  
  descendNotes.forEach((freq, i) => {
    setTimeout(() => {
      playTone(freq, 0.08, 'triangle', 0.12);
    }, i * 50);
  });
  
  // Rising confirmation after descend
  setTimeout(() => {
    ascendNotes.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, 0.15, 'sine', 0.18);
      }, i * 100);
    });
  }, 250);
}
