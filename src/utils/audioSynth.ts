// Web Audio API and Speech Synthesis engine for AI StoryWizard

let audioCtx: AudioContext | null = null;
let currentAmbientNodes: { oscList: OscillatorNode[]; gainNode: GainNode } | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playPageTurnSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch {
    // Graceful fallback if audio context blocked
  }
}

export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const startTime = ctx.currentTime + idx * 0.08;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  } catch {
    // Ignore audio error
  }
}

export function startAmbientSoundscape(soundId: string, volume: number = 0.3) {
  stopAmbientSoundscape();
  if (soundId === 'none') return;

  try {
    const ctx = getAudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const freqs = soundId === 'crystal-cavern'
      ? [261.63, 392.0, 523.25, 659.25]
      : soundId === 'cosmic-ambience'
      ? [110, 164.81, 220, 277.18]
      : soundId === 'cozy-rain'
      ? [130.81, 196.0, 261.63]
      : [220, 277.18, 329.63, 440];

    const oscList: OscillatorNode[] = [];

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (i % 2 === 0 ? 0.5 : -0.5), ctx.currentTime);

      oscGain.gain.setValueAtTime(0.03, ctx.currentTime);

      if (panner) {
        panner.pan.setValueAtTime((i % 2 === 0 ? 0.3 : -0.3), ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(panner);
        panner.connect(masterGain);
      } else {
        osc.connect(oscGain);
        oscGain.connect(masterGain);
      }

      osc.start();
      oscList.push(osc);
    });

    currentAmbientNodes = { oscList, gainNode: masterGain };
  } catch {
    // Ignore web audio limitations
  }
}

export function setAmbientVolume(volume: number) {
  if (currentAmbientNodes && audioCtx) {
    try {
      currentAmbientNodes.gainNode.gain.setTargetAtTime(volume * 0.15, audioCtx.currentTime, 0.1);
    } catch {
      // Ignored
    }
  }
}

export function stopAmbientSoundscape() {
  if (currentAmbientNodes) {
    try {
      currentAmbientNodes.oscList.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // Ignored
        }
      });
      currentAmbientNodes.gainNode.disconnect();
    } catch {
      // Ignored
    }
    currentAmbientNodes = null;
  }
}

export function speakStoryContent(
  text: string,
  options: {
    pitch?: number;
    rate?: number;
    voiceId?: string;
    onBoundary?: (charIndex: number) => void;
    onEnd?: () => void;
  } = {}
): () => void {
  if (!('speechSynthesis' in window)) {
    return () => {};
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = options.pitch ?? 1.0;
  utterance.rate = options.rate ?? 1.0;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    if (options.voiceId === 'friendly-robot') {
      const robotVoice = voices.find(v => v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('natural'));
      if (robotVoice) utterance.voice = robotVoice;
    } else if (options.voiceId === 'kind-storyteller') {
      const femaleVoice = voices.find(v => v.lang.startsWith('en') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('victoria')));
      if (femaleVoice) utterance.voice = femaleVoice;
    } else {
      const enVoice = voices.find(v => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
    }
  }

  if (options.onBoundary) {
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        options.onBoundary?.(event.charIndex);
      }
    };
  }

  if (options.onEnd) {
    utterance.onend = () => {
      options.onEnd?.();
    };
  }

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
  };
}
