// Audio Engine using Web Audio API for OK Shuttumani
// Zero external asset dependencies, zero latency, 100% original, works across mobile & desktop browsers

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.muted = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.currentStep = 0;
    this.tempo = 126; // BPM

    // Automatically bind user gesture unlock listener
    this.setupAutoUnlock();
  }

  setupAutoUnlock() {
    const unlock = () => {
      this.init();
      ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(evt => {
        window.removeEventListener(evt, unlock);
      });
    };

    ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(evt => {
      window.addEventListener(evt, unlock, { once: false, passive: true });
    });
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.65, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(0.55, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    this.init();

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.65, this.ctx.currentTime);
    }

    if (this.muted) {
      this.stopBGM();
    } else {
      if (this.bgmPlaying) {
        this.startBGM();
      }
    }
    return this.muted;
  }

  // Play a soft synthesised tone
  playTone(freq, type = 'sine', duration = 0.15, volume = 0.2, pitchDecay = false, isMusic = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (pitchDecay) {
        osc.frequency.linearRampToValueAtTime(Math.max(40, freq * 0.4), now + duration);
      }

      gain.gain.setValueAtTime(volume, now);
      gain.gain.linearRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      const targetDest = (isMusic && this.musicGain) ? this.musicGain : (this.masterGain || this.ctx.destination);
      gain.connect(targetDest);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // 1. UI Button Click sound
  playButtonClick() {
    if (this.muted) return;
    this.init();
    this.playTone(880, 'sine', 0.06, 0.18);
  }

  // 2. Subtle heart-collection sound
  playHeartCollect(isPosh = true) {
    if (this.muted) return;
    this.init();
    // Sweet bright bell chime
    const baseFreq = isPosh ? 659.25 : 587.33; // E5 for Posh (pink), D5 for Iba (purple)
    this.playTone(baseFreq, 'triangle', 0.12, 0.22);
    setTimeout(() => {
      this.playTone(baseFreq * 1.5, 'sine', 0.18, 0.18);
    }, 50);
  }

  // 3. Distinct Bestie Sync sound
  playBestieSync() {
    if (this.muted) return;
    this.init();
    // Gleaming harmonic flourish: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.28, 0.24);
        this.playTone(freq * 1.005, 'sine', 0.28, 0.12); // Shimmer chorus
      }, idx * 70);
    });
  }

  // 4a. Mischievous Pigeon Comic Collision Sound
  playPigeonHit() {
    if (this.muted) return;
    this.init();
    // Comic bouncy peck & squawk: rapid springy drop + quirky chirp
    this.playTone(360, 'triangle', 0.14, 0.22, true);
    setTimeout(() => {
      this.playTone(740, 'sine', 0.12, 0.18, true);
    }, 60);
  }

  // 4b. Floating Mushroom Puff Collision Sound
  playMushroomHit() {
    if (this.muted) return;
    this.init();
    // Whimsical soft comical puff: gentle warm 'poof'
    this.playTone(180, 'sine', 0.22, 0.24, true);
    setTimeout(() => {
      this.playTone(130, 'sine', 0.16, 0.16, true);
    }, 50);
  }

  // 4c. Hot-Air Balloon Positive Speed Boost Sound
  playSpeedBoost() {
    if (this.muted) return;
    this.init();
    // Cheerful, sparkling chiptune power-up arpeggio: G5 -> B5 -> D6 -> G6
    const boostNotes = [783.99, 987.77, 1174.66, 1567.98];
    boostNotes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.16, 0.22);
        this.playTone(freq * 1.5, 'sine', 0.12, 0.10); // Shimmer harmonic
      }, idx * 55);
    });
  }

  // Generic fallback for obstacle hits
  playObstacleHit() {
    this.playPigeonHit();
  }

  // 5. Short victory fanfare
  playVictory() {
    if (this.muted) return;
    this.init();
    // Upbeat celebratory melody: G4, C5, E5, G5, high C6
    const notes = [392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.35, 0.24);
      }, idx * 105);
    });
  }

  // 6. Soft birthday-letter reveal sound
  playLetterReveal() {
    if (this.muted) return;
    this.init();
    // Soft celestial harp glissando
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.45, 0.16);
      }, idx * 85);
    });
  }

  // 7. Cheerful chiptune background music loop
  startBGM() {
    this.bgmPlaying = true;
    if (this.muted) return;
    this.init();

    // Prevent duplicate timers
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }

    // Melody and Bassline arrays (Whimsical Sunset Voxel Theme in C major / A minor)
    const melody = [
      523.25, 0, 659.25, 783.99,  659.25, 523.25, 587.33, 0,
      440.00, 0, 523.25, 659.25,  523.25, 440.00, 493.88, 0,
      523.25, 587.33, 659.25, 783.99, 880.00, 783.99, 659.25, 587.33,
      659.25, 0, 587.33, 0, 523.25, 0, 0, 0
    ];

    const bass = [
      261.63, 0, 261.63, 0,  220.00, 0, 220.00, 0,
      174.61, 0, 174.61, 0,  196.00, 0, 196.00, 0,
      261.63, 0, 261.63, 0,  220.00, 0, 220.00, 0,
      174.61, 0, 196.00, 0,  261.63, 0, 261.63, 0
    ];

    const stepInterval = (60 / this.tempo) / 2 * 1000; // 16th notes approx

    const tick = () => {
      if (!this.bgmPlaying || this.muted) return;

      const mNote = melody[this.currentStep % melody.length];
      const bNote = bass[this.currentStep % bass.length];

      if (mNote > 0) {
        this.playTone(mNote, 'triangle', 0.15, 0.12, false, true);
      }
      if (bNote > 0) {
        this.playTone(bNote, 'sine', 0.22, 0.15, false, true);
      }

      this.currentStep++;
      this.bgmTimer = setTimeout(tick, stepInterval);
    };

    tick();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const sound = new SoundEngine();
