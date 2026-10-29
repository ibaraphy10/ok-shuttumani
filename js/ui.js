// UI Manager for OK Shuttumani
// Controls screens, HUD, virtual joystick, sound toggle, envelope animation, and letter

import { CONFIG } from './config.js';
import { sound } from './audio.js';

export class UIManager {
  constructor(game) {
    this.game = game;

    // Screens
    this.screens = {
      dashboard: document.getElementById('screen-dashboard'),
      game: document.getElementById('screen-game'),
      results: document.getElementById('screen-results'),
      letter: document.getElementById('screen-letter'),
      pauseModal: document.getElementById('modal-pause'),
    };

    // HUD Elements
    this.hud = {
      timer: document.getElementById('hud-timer'),
      scorePosh: document.getElementById('hud-score-posh'),
      scoreIba: document.getElementById('hud-score-iba'),
      meterPosh: document.getElementById('hud-meter-posh'),
      meterIba: document.getElementById('hud-meter-iba'),
      btnPause: document.getElementById('btn-pause'),
      btnSound: document.querySelectorAll('.btn-sound-toggle'),
    };

    // Results Elements
    this.results = {
      title: document.getElementById('results-title'),
      message: document.getElementById('results-message'),
      scoreSummary: document.getElementById('results-score-summary'),
      btnOpenLetter: document.getElementById('btn-open-letter'),
      btnPlayAgain: document.getElementById('btn-results-play-again'),
      btnDashboard: document.getElementById('btn-results-dashboard'),
    };

    // Letter Elements
    this.letter = {
      envelopeContainer: document.getElementById('envelope-container'),
      letterPaper: document.getElementById('letter-paper'),
      letterText: document.getElementById('letter-content'),
      btnPlayAgain: document.getElementById('btn-letter-play-again'),
      btnDashboard: document.getElementById('btn-letter-dashboard'),
    };

    // Virtual Joystick
    this.joystick = {
      zone: document.getElementById('joystick-zone'),
      knob: document.getElementById('joystick-knob'),
      base: document.getElementById('joystick-base'),
      active: false,
      originX: 0,
      originY: 0,
      maxRadius: 40,
    };

    this.initAvatarShowcase();
    this.bindEvents();
    this.initLetterContent();
  }

  initAvatarShowcase() {
    this.canvasIba = document.getElementById('showcase-iba');
    this.canvasPosh = document.getElementById('showcase-posh');
    if (this.canvasIba && this.canvasPosh) {
      this.ctxIba = this.canvasIba.getContext('2d');
      this.ctxPosh = this.canvasPosh.getContext('2d');
    }
  }

  updateAvatarShowcase(time) {
    if (!this.ctxIba || !this.ctxPosh) return;
    if (this.screens.dashboard && !this.screens.dashboard.classList.contains('hidden')) {
      this.game.renderer.renderAvatarToContext(this.ctxIba, 'Iba', 70, 66, time);
      this.game.renderer.renderAvatarToContext(this.ctxPosh, 'Posh', 70, 66, time + 0.8);
    }
  }

  bindEvents() {
    // 1. Dashboard Buttons
    const btnPlay = document.getElementById('btn-dashboard-play');
    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        sound.playButtonClick();
        this.showScreen('game');
        this.game.startRound();
      });
    }

    const btnDashboardLetter = document.getElementById('btn-dashboard-letter');
    if (btnDashboardLetter) {
      btnDashboardLetter.addEventListener('click', () => {
        sound.playButtonClick();
        this.showLetterDirectly();
      });
    }

    // 2. Sound Toggle
    this.hud.btnSound.forEach(btn => {
      btn.addEventListener('click', () => {
        const isMuted = sound.toggleMute();
        this.updateSoundButtons(isMuted);
      });
    });

    // 3. Pause Button & Modal
    if (this.hud.btnPause) {
      this.hud.btnPause.addEventListener('click', () => {
        sound.playButtonClick();
        this.game.togglePause();
      });
    }

    const btnResume = document.getElementById('btn-resume');
    if (btnResume) {
      btnResume.addEventListener('click', () => {
        sound.playButtonClick();
        this.game.togglePause();
      });
    }

    const btnQuit = document.getElementById('btn-pause-quit');
    if (btnQuit) {
      btnQuit.addEventListener('click', () => {
        sound.playButtonClick();
        this.game.state = 'DASHBOARD';
        this.game.setupDashboardScene();
        this.showScreen('dashboard');
      });
    }

    // 4. Results Screen Buttons
    if (this.results.btnOpenLetter) {
      this.results.btnOpenLetter.addEventListener('click', () => {
        sound.playButtonClick();
        this.startEnvelopeOpeningSequence();
      });
    }

    if (this.results.btnPlayAgain) {
      this.results.btnPlayAgain.addEventListener('click', () => {
        sound.playButtonClick();
        this.showScreen('game');
        this.game.startRound();
      });
    }

    if (this.results.btnDashboard) {
      this.results.btnDashboard.addEventListener('click', () => {
        sound.playButtonClick();
        this.game.state = 'DASHBOARD';
        this.game.setupDashboardScene();
        this.showScreen('dashboard');
      });
    }

    // 5. Letter Screen Buttons
    if (this.letter.btnPlayAgain) {
      this.letter.btnPlayAgain.addEventListener('click', () => {
        sound.playButtonClick();
        this.showScreen('game');
        this.game.startRound();
      });
    }

    if (this.letter.btnDashboard) {
      this.letter.btnDashboard.addEventListener('click', () => {
        sound.playButtonClick();
        this.game.state = 'DASHBOARD';
        this.game.setupDashboardScene();
        this.showScreen('dashboard');
      });
    }

    // 6. Setup Virtual Joystick
    this.setupVirtualJoystick();
  }

  updateSoundButtons(isMuted) {
    this.hud.btnSound.forEach(btn => {
      btn.innerHTML = isMuted ? '🔇' : '🔊';
      btn.setAttribute('aria-label', isMuted ? 'Unmute Sound' : 'Mute Sound');
    });
  }

  setupVirtualJoystick() {
    const zone = this.joystick.zone;
    if (!zone) return;

    const onPointerDown = (e) => {
      this.joystick.active = true;
      const rect = zone.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      this.joystick.originX = rect.left + rect.width / 2;
      this.joystick.originY = rect.top + rect.height / 2;
      this.updateJoystickPosition(clientX, clientY);
      zone.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!this.joystick.active) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      this.updateJoystickPosition(clientX, clientY);
    };

    const onPointerUp = (e) => {
      if (!this.joystick.active) return;
      this.joystick.active = false;
      this.joystick.knob.style.transform = `translate(0px, 0px)`;
      this.game.setJoystickInput(0, 0);
    };

    zone.addEventListener('pointerdown', onPointerDown);
    zone.addEventListener('pointermove', onPointerMove);
    zone.addEventListener('pointerup', onPointerUp);
    zone.addEventListener('pointercancel', onPointerUp);
  }

  updateJoystickPosition(clientX, clientY) {
    let dx = clientX - this.joystick.originX;
    let dy = clientY - this.joystick.originY;
    const distance = Math.hypot(dx, dy);

    if (distance > this.joystick.maxRadius) {
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * this.joystick.maxRadius;
      dy = Math.sin(angle) * this.joystick.maxRadius;
    }

    this.joystick.knob.style.transform = `translate(${dx}px, ${dy}px)`;

    // Normalized input vector (-1.0 to 1.0)
    const normX = dx / this.joystick.maxRadius;
    const normY = dy / this.joystick.maxRadius;
    this.game.setJoystickInput(normX, normY);
  }

  initLetterContent() {
    const L = CONFIG.LETTER;
    this.letter.letterText.innerHTML = `
      <div class="letter-salutation">${L.SALUTATION}</div>
      <p class="letter-para">${L.PARAGRAPH_1}</p>
      <p class="letter-para">${L.PARAGRAPH_2}</p>
      <p class="letter-para">${L.PARAGRAPH_3}</p>
      <div class="letter-closing">
        <div>${L.CLOSING}</div>
        <div class="letter-signature">${L.SIGNATURE} 💖</div>
      </div>
    `;
  }

  showScreen(screenName) {
    Object.keys(this.screens).forEach(key => {
      if (this.screens[key]) {
        this.screens[key].classList.add('hidden');
      }
    });

    if (this.screens[screenName]) {
      this.screens[screenName].classList.remove('hidden');
    }
  }

  updateHUD({ timer, scorePosh, scoreIba, maxScoreEstimate }) {
    if (this.hud.timer) {
      this.hud.timer.textContent = `${timer}s`;
    }
    if (this.hud.scorePosh) {
      this.hud.scorePosh.textContent = `${scorePosh}`;
    }
    if (this.hud.scoreIba) {
      this.hud.scoreIba.textContent = `${scoreIba}`;
    }

    const pctPosh = Math.min(100, Math.round((scorePosh / maxScoreEstimate) * 100));
    const pctIba = Math.min(100, Math.round((scoreIba / maxScoreEstimate) * 100));

    if (this.hud.meterPosh) {
      this.hud.meterPosh.style.width = `${pctPosh}%`;
    }
    if (this.hud.meterIba) {
      this.hud.meterIba.style.width = `${pctIba}%`;
    }
  }

  showResults({ outcome, scorePosh, scoreIba }) {
    this.showScreen('results');

    let resultConfig;
    if (outcome === 'POSH') {
      resultConfig = CONFIG.RESULTS.POSH_WINS;
    } else if (outcome === 'IBA') {
      resultConfig = CONFIG.RESULTS.IBA_WINS;
    } else {
      resultConfig = CONFIG.RESULTS.TIE;
    }

    this.results.title.textContent = resultConfig.title;
    this.results.message.textContent = resultConfig.message;
    this.results.scoreSummary.innerHTML = `
      <div class="score-pill posh-pill">Posh: <strong>${scorePosh}</strong> pts</div>
      <div class="score-pill iba-pill">Iba: <strong>${scoreIba}</strong> pts</div>
    `;
  }

  // 5-second cute voxel envelope opening sequence
  startEnvelopeOpeningSequence() {
    this.showScreen('letter');
    this.letter.envelopeContainer.classList.remove('hidden');
    this.letter.letterPaper.classList.add('hidden');
    this.letter.envelopeContainer.classList.remove('opening');

    sound.playLetterReveal();

    // Trigger opening animation
    requestAnimationFrame(() => {
      this.letter.envelopeContainer.classList.add('opening');
    });

    // After ~4.5 seconds of envelope opening & sparkles, reveal the birthday letter
    setTimeout(() => {
      this.letter.envelopeContainer.classList.add('hidden');
      this.letter.letterPaper.classList.remove('hidden');
      this.letter.letterPaper.classList.add('fade-in');
    }, 4500);
  }

  showLetterDirectly() {
    this.showScreen('letter');
    this.letter.envelopeContainer.classList.add('hidden');
    this.letter.letterPaper.classList.remove('hidden');
    this.letter.letterPaper.classList.add('fade-in');
  }

  showPauseModal(isPaused) {
    if (this.screens.pauseModal) {
      if (isPaused) {
        this.screens.pauseModal.classList.remove('hidden');
      } else {
        this.screens.pauseModal.classList.add('hidden');
      }
    }
  }
}
