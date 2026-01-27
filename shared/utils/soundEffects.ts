// Sound effects using Web Audio API - no external files needed

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  // Envelope for smoother sound
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

export function playCorrectSound() {
  // Pleasant ascending two-tone chime
  playTone(523.25, 0.15, 'sine', 0.25); // C5
  setTimeout(() => playTone(659.25, 0.2, 'sine', 0.25), 100); // E5
}

export function playIncorrectSound() {
  // Soft descending tone
  playTone(311.13, 0.15, 'sine', 0.2); // Eb4
  setTimeout(() => playTone(261.63, 0.2, 'sine', 0.2), 100); // C4
}

export function playSwipeSound() {
  // Quick subtle swoosh
  playTone(400, 0.08, 'sine', 0.15);
}

export function playSuccessSound() {
  // Celebratory ascending arpeggio for achievements
  playTone(523.25, 0.12, 'sine', 0.2); // C5
  setTimeout(() => playTone(659.25, 0.12, 'sine', 0.2), 80); // E5
  setTimeout(() => playTone(783.99, 0.2, 'sine', 0.25), 160); // G5
}

// Check if sound is enabled in localStorage
export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem('soundEnabled');
  return stored !== 'false'; // Default to enabled
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('soundEnabled', String(enabled));
}

// Wrapper functions that check if sound is enabled
export function playCorrect() {
  if (isSoundEnabled()) playCorrectSound();
}

export function playIncorrect() {
  if (isSoundEnabled()) playIncorrectSound();
}

export function playSwipe() {
  if (isSoundEnabled()) playSwipeSound();
}

export function playSuccess() {
  if (isSoundEnabled()) playSuccessSound();
}
