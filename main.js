/**
 * main.js
 * -----------------------------------------------------------------------
 * Orquesta el flujo completo de la app:
 *
 *   Bienvenida de Redi -> permiso de cámara -> visor submarino ->
 *   detección de página -> escena correspondiente -> cambio automático
 *   al detectar otra página, todo dentro de la misma página web.
 *
 * Este archivo NO contiene lógica de negocio: solo conecta los módulos
 * especializados (UIManager, AudioManager, ARManager, SceneManager,
 * Analytics).
 * -----------------------------------------------------------------------
 */

import AudioManager from "./audio-manager.js";
import UIManager from "./ui-manager.js";
import ARManager from "./ar-manager.js";
import SceneManager from "./scene-manager.js";
import Analytics from "./analytics.js";
import { REDI_HAPPY, getSceneConfig } from "./config.js";
import { getRemoteValue, EDITABLE_FIELDS } from "./remote-config.js";

class RediApp {
  constructor() {
    this.audio = new AudioManager();
    this.ui = new UIManager(this.audio);
    this.analytics = new Analytics();

    this.sceneManager = new SceneManager({
      uiManager: this.ui,
      audioManager: this.audio,
      analytics: this.analytics,
    });

    this.arManager = new ARManager({
      onTargetFound: (sceneId) => this._handleTargetFound(sceneId),
      onTargetLost: (sceneId) => this._handleTargetLost(sceneId),
    });
  }

  /** Arranca la app mostrando la pantalla de bienvenida de Redi. */
  init() {
    this.analytics.track("session_start");
    this._applyRemoteOverrides(); // no bloquea la bienvenida, se aplica en paralelo
    this.ui.showWelcome({ rediImage: REDI_HAPPY, onStart: () => this._startCamera() });
  }

  /**
   * Trae del panel de admin los valores que se hayan editado (duración
   * de cada intento, del juego final, cantidad de peces, etc.) y los
   * aplica sobre config.js EN MEMORIA antes de que arranque cualquier
   * escena. Si el servicio remoto no responde, cada escena se queda
   * con su valor por defecto — nunca bloquea ni rompe el juego.
   */
  async _applyRemoteOverrides() {
    await Promise.all(
      EDITABLE_FIELDS.map(async ({ key, sceneIds, field }) => {
        const defaultValue = getSceneConfig(sceneIds[0])[field];
        const remoteValue = await getRemoteValue(key, defaultValue);
        sceneIds.forEach((sceneId) => {
          const scene = getSceneConfig(sceneId);
          if (scene) scene[field] = remoteValue;
        });
      })
    );
  }

  async _startCamera() {
    this.ui.showLoading("Preparando la cámara...");

    try {
      // Dejamos que sea MindAR el único que pide el permiso de cámara.
      // Pedirlo nosotros primero "a mano" y liberarlo enseguida generaba
      // conflictos en varios Android (la cámara quedaba colgada sin
      // avisar ningún error).
      await this.arManager.start();

      this.ui.hideLoading();
      this.ui.showViewer();
    } catch (err) {
      this.ui.hideLoading();
      this.ui.showToast(
        "No pudimos activar la cámara. Revisá los permisos del navegador y volvé a intentar 📷",
        5000
      );
    }
  }

  _handleTargetFound(sceneId) {
    this.ui.setViewerStatus("¡Página encontrada!");
    this.sceneManager.showScene(sceneId);
  }

  _handleTargetLost(sceneId) {
    this.ui.setViewerStatus("Buscando una página...");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const app = new RediApp();
  app.init();
});
