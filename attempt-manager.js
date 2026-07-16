/**
 * attempt-manager.js
 * -----------------------------------------------------------------------
 * Controla el ciclo de la página "mar_pesca1" (no se pesca nada):
 *   1. Cartel con Redi (feliz) avisando cuánto tiempo tienen.
 *   2. Al tocar "¡Vamos!": empiezan a entrar peces desde los costados,
 *      cruzan la pantalla y salen por el otro lado. Si el chico toca
 *      uno, se escapa rápido — nunca se atrapa. En cuanto un pez sale
 *      de pantalla (solo o escapando), entra el siguiente, generando
 *      un flujo continuo durante toda la cuenta regresiva (a
 *      propósito: es la página que genera frustración).
 *   3. Al llegar a cero: Redi (triste) avisa que no sacaron nada.
 * -----------------------------------------------------------------------
 */

import FishSprite from "./fish-sprite.js";
import BubbleSprite from "./bubble-sprite.js";
import { REDI_HAPPY, REDI_SAD } from "./config.js";

class AttemptManager {
  constructor(uiManager, audioManager, analytics) {
    this.ui = uiManager;
    this.audio = audioManager;
    this.analytics = analytics;

    this.container = null;
    this.currentFish = null;
    this.nextFishTimeout = null;
    this.bubbleInterval = null;
    this.countdownInterval = null;
    this.timeLeft = 0;
    this.running = false;
  }

  start(config, container) {
    this.container = container;
    this.config = config;

    this.ui.showTimeIntroCard({
      rediImage: REDI_HAPPY,
      message: `Tenemos ${config.duration} segundos para atrapar la mayor cantidad de peces.`,
      buttonLabel: "¡Vamos!",
      onStart: () => this._beginCountdownRound(),
    });
  }

  _beginCountdownRound() {
    this.running = true;
    this.timeLeft = this.config.duration;
    this.ui.setTimerVisible(true);
    this.ui.updateTimer(this.timeLeft);

    this.analytics.track("attempt_started", { sceneId: this.config.id, duration: this.config.duration });

    this._spawnBubbles();
    this._spawnNextFish(0); // el primero entra enseguida

    this.countdownInterval = setInterval(() => {
      this.timeLeft -= 1;
      this.ui.updateTimer(this.timeLeft);
      if (this.timeLeft <= 0) this._endAttempt();
    }, 1000);
  }

  /**
   * Hace entrar un pez nuevo desde un costado. Cuando ese pez sale de
   * pantalla (solo o porque lo asustaron), programa la entrada del
   * siguiente — así hay un flujo continuo de peces durante toda la
   * ronda, nunca uno solo quieto.
   */
  _spawnNextFish(delayMs) {
    clearTimeout(this.nextFishTimeout);
    this.nextFishTimeout = setTimeout(() => {
      if (!this.running) return;

      this.currentFish = new FishSprite({
        container: this.container,
        frameA: "pez1_a.svg",
        frameB: "pez1_b.svg",
        mode: "cruise",
        catchable: false,
        speedFactor: 0.85 + Math.random() * 0.5,
        scale: 0.9 + Math.random() * 0.3,
        onEscape: () => this.audio.play("escape"),
        onExit: () => {
          if (!this.running) return;
          // Pequeña pausa antes de que entre el próximo, para que no
          // se sienta instantáneo.
          this._spawnNextFish(300 + Math.random() * 500);
        },
      });
    }, delayMs);
  }

  /** Burbujas continuas (bubija_1/bubija_2), bastante seguido para dar vida. */
  _spawnBubbles() {
    const spawnOne = () => {
      if (!this.running) return;
      new BubbleSprite({
        container: this.container,
        frameA: "bubija_1.svg",
        frameB: "bubija_2.svg",
      });
    };
    spawnOne();
    spawnOne();
    this.bubbleInterval = setInterval(spawnOne, 500);
  }

  _endAttempt() {
    this.stop();
    this.analytics.track("attempt_timeout", { sceneId: this.config.id });

    this.ui.showTimeoutCard({
      rediImage: REDI_SAD,
      title: "¡Se acabó el tiempo!",
      message: "Tiramos las redes y no sacamos nada.",
      buttonLabel: "Buscar la próxima página",
      onContinue: () => {
        this.ui.setViewerStatus("Buscando una página...");
      },
    });
  }

  /** Detiene por completo el intento actual (timers, peces, burbujas). */
  stop() {
    this.running = false;
    clearInterval(this.countdownInterval);
    clearInterval(this.bubbleInterval);
    clearTimeout(this.nextFishTimeout);
    this.ui.setTimerVisible(false);
    if (this.currentFish) {
      this.currentFish.destroy();
      this.currentFish = null;
    }
  }
}

export default AttemptManager;
