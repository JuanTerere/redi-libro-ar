/**
 * attempt-manager.js
 * -----------------------------------------------------------------------
 * Controla el ciclo de las páginas 1 a 4 ("attempt"):
 *   1. Cartel con Redi (feliz) avisando cuánto tiempo tienen.
 *   2. Al tocar "¡Vamos!": aparece un pez que nada libremente y NO se
 *      puede atrapar, con burbujas subiendo de fondo.
 *   3. Corre la cuenta regresiva configurada en config.js.
 *   4. Al llegar a cero: Redi (triste) avisa que no sacaron nada e
 *      invita a probar en la próxima página.
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
    this.fish = null;
    this.bubbleInterval = null;
    this.countdownInterval = null;
    this.timeLeft = 0;
    this.running = false;
  }

  /**
   * @param {Object} config - configuración de la escena "attempt".
   * @param {HTMLElement} container - contenedor donde dibujar fondo/pez/burbujas.
   */
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
    this._spawnFish();

    this.countdownInterval = setInterval(() => {
      this.timeLeft -= 1;
      this.ui.updateTimer(this.timeLeft);
      if (this.timeLeft <= 0) this._endAttempt();
    }, 1000);
  }

  /** Un único pez (por ahora) que nada libremente sin poder atraparse. */
  _spawnFish() {
    this.fish = new FishSprite({
      container: this.container,
      frameA: "pez1_a.svg",
      frameB: "pez1_b.svg",
      catchable: false,
      speedFactor: 0.8,
      scale: 1,
      onEscape: () => this.audio.play("escape"),
    });
  }

  /** Burbujas continuas (bubija_1/bubija_2), sin algas ni otra decoración. */
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
    this.bubbleInterval = setInterval(spawnOne, 900);
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

  /** Detiene por completo el intento actual (timers, pez, burbujas). */
  stop() {
    this.running = false;
    clearInterval(this.countdownInterval);
    clearInterval(this.bubbleInterval);
    this.ui.setTimerVisible(false);
    if (this.fish) {
      this.fish.destroy();
      this.fish = null;
    }
  }
}

export default AttemptManager;
