/**
 * scene-manager.js
 * -----------------------------------------------------------------------
 * Responsable de montar y desmontar visualmente la escena que corresponde
 * a la página detectada por la cámara: fondo, y delega el resto según
 * el tipo de escena.
 *
 *   "attempt" -> AttemptManager (páginas 1 a 4)
 *   "finale"  -> FinaleManager (página "mar_pesca_feliz")
 *
 * No sabe nada de MindAR: recibe simplemente "mostrar la escena X" y
 * "ocultar la escena actual".
 * -----------------------------------------------------------------------
 */

import AttemptManager from "./attempt-manager.js";
import FinaleManager from "./finale-manager.js";
import { getSceneConfig } from "./config.js";

class SceneManager {
  constructor({ uiManager, audioManager, analytics }) {
    this.ui = uiManager;
    this.audio = audioManager;
    this.analytics = analytics;

    this.sceneContainer = document.getElementById("scene-container");
    this.currentSceneId = null;

    this.attemptManager = new AttemptManager(this.ui, this.audio, this.analytics);
    this.finaleManager = new FinaleManager(this.ui, this.audio, this.analytics);
  }

  /** Se llama cada vez que MindAR detecta un marcador nuevo. */
  showScene(sceneId) {
    if (sceneId === this.currentSceneId) return; // ya está mostrada

    const config = getSceneConfig(sceneId);
    if (!config) return;

    this._teardownCurrentScene();
    this.currentSceneId = sceneId;

    // Activa el sonido de fondo del agua automáticamente para cualquier escena activa (Attempt o Finale)
    this.audio.startLoop("agua");

    if (config.type === "attempt") {
      this.attemptManager.start(config, this.sceneContainer);
    } else if (config.type === "finale") {
      this.finaleManager.start(config, this.sceneContainer);
    }
  }

  /** Oculta y limpia por completo la escena actual. */
  _teardownCurrentScene() {
    this.attemptManager.stop();
    this.finaleManager.stop();
    
    // Detiene el sonido del agua cuando se pierde el marcador o se limpia la escena
    this.audio.stopLoop("agua");

    this.sceneContainer.innerHTML = "";
    this.currentSceneId = null;
    this.ui.setScoreVisible(false);
    this.ui.setTimerVisible(false);
  }
}

export default SceneManager;
