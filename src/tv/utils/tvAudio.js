/**
 * tvAudio.js
 * ───────────────────────────────────────────────────────────
 * Procedural UI sound effects using the Web Audio API.
 * Requires zero external audio assets! Provides classic,
 * crisp, satisfying audio feedback for TV remote navigation.
 * ───────────────────────────────────────────────────────────
 */

class TVSoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.initialized = false;
    }

    init() {
        if (this.initialized || typeof window === 'undefined') return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
                this.initialized = true;
            }
        } catch {
            // Web Audio not supported or blocked
        }
    }

    setEnabled(enabled) {
        this.enabled = !!enabled;
    }

    /**
     * Soft subtle "tick" when moving focus between elements
     */
    playFocusSound() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.035);

            gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.035);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.04);
        } catch {
            // Audio error safeguard
        }
    }

    /**
     * Resonant confirmation "chime" when pressing Select / Enter
     */
    playSelectSound() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
            osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.05); // E5

            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.18);
        } catch {
            // Audio error safeguard
        }
    }

    /**
     * Low cancellation tone when pressing Back / Escape
     */
    playBackSound() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(392, this.ctx.currentTime); // G4
            osc.frequency.exponentialRampToValueAtTime(261.63, this.ctx.currentTime + 0.08); // C4

            gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.09);
        } catch {
            // Audio error safeguard
        }
    }

    playSelect() {
        this.playSelectSound();
    }

    playFocus() {
        this.playFocusSound();
    }

    playBack() {
        this.playBackSound();
    }
}

export const tvAudio = new TVSoundManager();
