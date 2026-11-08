import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Web Audio API context for browser/desktop acoustic feedback
let audioCtx: any = null;

const getAudioContext = () => {
  if (Platform.OS !== 'web') return null;
  if (typeof window === 'undefined') return null;

  try {
    const AudioContextClass =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
};

const playTone = (freq: number, durationMs: number, type: OscillatorType = 'sine', gainVal = 0.08) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch {
    // Ignore audio errors
  }
};

export const triggerFeedback = {
  // Keypad or soft touch
  tap: async () => {
    if (Platform.OS === 'web') {
      playTone(1000, 25, 'sine', 0.03);
      return;
    }
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore
    }
  },

  // Zebra/Honeywell Barcode Scanner Chime
  scanBeep: async () => {
    if (Platform.OS === 'web') {
      playTone(2093, 45, 'sine', 0.1); // High C7 retail barcode chirp
      return;
    }
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore
    }
  },

  selection: async () => {
    if (Platform.OS === 'web') {
      playTone(880, 20, 'sine', 0.02);
      return;
    }
    try {
      await Haptics.selectionAsync();
    } catch {
      // Ignore
    }
  },

  success: async () => {
    if (Platform.OS === 'web') {
      // Ascending two-tone payment confirmation chime
      playTone(1046.5, 70, 'sine', 0.08); // C6
      setTimeout(() => {
        playTone(1318.5, 120, 'sine', 0.08); // E6
      }, 70);
      return;
    }
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore
    }
  },

  warning: async () => {
    if (Platform.OS === 'web') {
      playTone(520, 80, 'triangle', 0.08);
      setTimeout(() => playTone(520, 80, 'triangle', 0.08), 100);
      return;
    }
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // Ignore
    }
  },

  error: async () => {
    if (Platform.OS === 'web') {
      playTone(240, 160, 'sawtooth', 0.06);
      return;
    }
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Ignore
    }
  },
};
