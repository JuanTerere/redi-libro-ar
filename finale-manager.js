/**
 * finale-manager.js
 * -----------------------------------------------------------------------
 * Orquesta toda la escena "mar_pesca_feliz":
 *   1. Redi pregunta "Hola, ¿querés ir a pescar?" (SI/NO).
 *      - NO  -> pantalla de cierre/invitación (Redi feliz + link a
 *               "La Gran Carrera"), termina el ciclo.
 *      - SI  -> pasa a la pregunta de la razón correcta.
 *   2. Pregunta de opción múltiple ("¿por qué ahora sí...?").
 *      - Incorrecta -> Redi triste + botón "Volver", que reinicia el
 *        ciclo completo desde el paso 1 (SI/NO de nuevo).
 *      - Correcta   -> mensaje de acierto y arranca GameManager.
 * -----------------------------------------------------------------------
 */

import GameManager from "./game-manager.js";
import { REDI_HAPPY, REDI_SAD } from "./config.js";

class FinaleManager {
  constructor(uiManager, audioManager, analytics) {
    this.ui = uiManager;
    this.audio = audioManager;
    this.analytics = analytics;
    this.gameManager = new GameManager(uiManager, audioManager, analytics);
  }

  start(config, container) {
    this.config = config;
    this.container = container;
    this._askGate();
  }

  /** Detiene cualquier ronda de juego activa (al salir de la escena). */
  stop() {
    this.gameManager.stop();
  }

  _askGate() {
    this.ui.showYesNoCard({
      rediImage: REDI_HAPPY,
      message: this.config.gateQuestion,
      yesLabel: "¡Sí!",
      noLabel: "No",
      onYes: () => {
        this.analytics.track("finale_gate_answered", { answer: "yes" });
        this._askReason();
      },
      onNo: () => {
        this.analytics.track("finale_gate_answered", { answer: "no" });
        this._showClosing();
      },
    });
  }

  _showClosing() {
    this.ui.showClosingScreen({
      rediImage: REDI_HAPPY,
      onAction: () => {
        this.ui.setViewerStatus("Buscando una página...");
      },
    });
  }

  _askReason() {
    this.ui.showReasonQuiz({
      rediHappy: REDI_HAPPY,
      rediSad: REDI_SAD,
      question: this.config.reasonQuestion,
      options: this.config.reasonOptions,
      incorrectMessage: this.config.incorrectMessage,
      correctMessage: this.config.correctMessage,
      onIncorrect: () => {
        this.audio.play("incorrecto");
        this.analytics.track("finale_quiz_answered", { correct: false });
        // Reinicia todo el ciclo desde la pregunta SI/NO.
        this._askGate();
      },
      onCorrect: (closeModal) => {
        this.audio.play("correcto");
        this.analytics.track("finale_quiz_answered", { correct: true });
        setTimeout(() => {
          closeModal();
          this.gameManager.start(this.config, this.container);
        }, 1400);
      },
    });
  }
}

export default FinaleManager;
