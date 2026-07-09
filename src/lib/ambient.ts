/**
 * Ambient soundtrack: Erik Satie, Gymnopédie No. 1 (public domain
 * composition; recording by Kevin MacLeod, incompetech.com, CC BY 3.0,
 * credited in the site footer). Single track, looped.
 *
 * On by default: playback starts when the boot sequence finishes
 * ("er:ready"). Browsers refuse unmuted autoplay without a user gesture,
 * so every refused play() arms a one-shot gesture listener and starts on
 * the visitor's first interaction instead. An explicit OFF persists.
 */

const SRC = "/audio/gymnopedie-no-1.mp3";
const KEY = "er:snd";
const TARGET_VOLUME = 0.22;

class AmbientPlayer {
  enabled = false;
  private audio: HTMLAudioElement | null = null;
  private fadeRaf = 0;
  private armed = false;

  /** Call once on the client. Returns the effective preference. */
  init(): boolean {
    if (typeof window === "undefined") return false;
    try {
      // Default ON; only an explicit OFF is remembered as off.
      this.enabled = window.localStorage.getItem(KEY) !== "0";
    } catch {
      this.enabled = true;
    }
    document.addEventListener("visibilitychange", this.onVisibility);
    if (this.enabled) {
      // Start with the site, once the preloader wipes. The reduced-motion
      // path dispatches er:ready before this listener can attach, so a
      // timeout fallback covers that and any other missed dispatch.
      const onReady = () => {
        window.clearTimeout(fallback);
        this.start();
      };
      window.addEventListener("er:ready", onReady, { once: true });
      const fallback = window.setTimeout(() => {
        window.removeEventListener("er:ready", onReady);
        this.start();
      }, 5000);
    }
    return this.enabled;
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    try {
      window.localStorage.setItem(KEY, this.enabled ? "1" : "0");
    } catch {
      // Private mode: the toggle still works for this visit.
    }
    if (this.enabled) this.start();
    else this.stop();
    return this.enabled;
  }

  private onVisibility = () => {
    const audio = this.audio;
    if (!audio) return;
    if (document.hidden) {
      audio.pause();
    } else if (this.enabled) {
      void audio.play().catch(() => this.armGesture());
    }
  };

  private ensure(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio(SRC);
      this.audio.loop = true;
      // "none": the 2.5MB track must not compete with first paint. It
      // buffers only when play() is actually called.
      this.audio.preload = "none";
      this.audio.volume = 0;
    }
    return this.audio;
  }

  private start() {
    const audio = this.ensure();
    audio
      .play()
      .then(() => this.fade(TARGET_VOLUME, 1400))
      .catch(() => this.armGesture());
  }

  private stop() {
    const audio = this.audio;
    if (!audio) return;
    this.fade(0, 600, () => audio.pause());
  }

  private armGesture() {
    if (this.armed) return;
    this.armed = true;
    const onGesture = () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      this.armed = false;
      if (this.enabled) this.start();
    };
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
  }

  private fade(to: number, ms: number, onDone?: () => void) {
    const audio = this.audio;
    if (!audio) return;
    cancelAnimationFrame(this.fadeRaf);
    const from = audio.volume;
    const t0 = performance.now();
    const step = (t: number) => {
      // rAF timestamps can precede the scheduling call's performance.now(),
      // so progress must be clamped at BOTH ends or the ease overshoots
      // and volume leaves [0, 1] (IndexSizeError).
      const p = Math.min(1, Math.max(0, (t - t0) / ms));
      const eased = 1 - Math.pow(1 - p, 3);
      audio.volume = Math.min(1, Math.max(0, from + (to - from) * eased));
      if (p < 1) {
        this.fadeRaf = requestAnimationFrame(step);
      } else {
        onDone?.();
      }
    };
    this.fadeRaf = requestAnimationFrame(step);
  }
}

export const ambient = new AmbientPlayer();
