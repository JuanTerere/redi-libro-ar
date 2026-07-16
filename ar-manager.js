/**
 * ar-manager.js
 * -----------------------------------------------------------------------
 * Único módulo que sabe de MindAR y A-Frame. Se encarga de:
 *   1. Inyectar dinámicamente la <a-scene> con un <a-entity
 *      mindar-image-target> por cada escena definida en config.js.
 *   2. Escuchar los eventos targetFound/targetLost de cada target
 *      (funciona en CUALQUIER orden: el chico puede escanear
 *      directamente su página favorita, no hace falta ir en secuencia).
 *   3. Exponer callbacks simples (onTargetFound, onTargetLost) para que
 *      main.js conecte esto con SceneManager sin acoplar los módulos.
 * -----------------------------------------------------------------------
 */

import { SCENES, MARKER_FILE } from "./config.js";

class ARManager {
  constructor({ onTargetFound, onTargetLost }) {
    this.onTargetFound = onTargetFound;
    this.onTargetLost = onTargetLost;
    this.sceneEl = null;
    this.mindarSystem = null;
  }

  /**
   * Construye la escena A-Frame + MindAR dentro de #ar-mount y arranca
   * la cámara. Devuelve una Promise que se resuelve cuando MindAR
   * terminó de inicializar, o se rechaza si algo falla (permiso de
   * cámara denegado, error de MindAR, o se pasó de un tiempo límite
   * razonable) — así la app nunca se queda "colgada" en silencio.
   */
  async start() {
    const mount = document.getElementById("ar-mount");
    mount.innerHTML = this._buildSceneHTML();
    this.sceneEl = mount.querySelector("a-scene");

    if (!this.sceneEl) {
      throw new Error("No se pudo crear la escena de realidad aumentada.");
    }

    this._attachTargetListeners();

    return new Promise((resolve, reject) => {
      let settled = false;

      const onReady = () => {
        if (settled) return;
        settled = true;
        this.mindarSystem = this.sceneEl.systems["mindar-image-system"];
        resolve();
      };

      const onError = (err) => {
        if (settled) return;
        settled = true;
        reject(err instanceof Error ? err : new Error("Error al iniciar la cámara AR."));
      };

      this.sceneEl.addEventListener("renderstart", onReady, { once: true });
      // MindAR emite este evento si falla al pedir la cámara internamente.
      this.sceneEl.addEventListener("arError", () => onError(), { once: true });

      // Salvavidas: si en 12s no pasó nada (ni éxito ni error explícito),
      // avisamos igual en vez de dejar la pantalla de carga infinita.
      setTimeout(() => onError(new Error("Tiempo de espera agotado al iniciar la cámara.")), 12000);
    });
  }

  /** Genera el markup de la escena a partir de las escenas de config.js. */
  _buildSceneHTML() {
    const targets = SCENES.map(
      (scene) => `
      <a-entity mindar-image-target="targetIndex: ${scene.targetIndex}" data-scene-id="${scene.id}">
        <!-- Punto de anclaje 2D vacío: el contenido visual real de cada
             página se dibuja como overlay HTML sobre la cámara (ver
             scene-manager.js), no como geometría 3D. Este plano
             invisible solo mantiene el tracking activo. -->
        <a-plane opacity="0" width="1" height="1"></a-plane>
      </a-entity>`
    ).join("\n");

    return `
      <a-scene
        mindar-image="imageTargetSrc: ${MARKER_FILE}; autoStart: true; uiScanning: no; uiLoading: no; uiError: no; filterMinCF: 0.0001; filterBeta: 0.01;"
        color-space="sRGB"
        embedded
        renderer="colorManagement: true, physicallyCorrectLights: true, alpha: true"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
      >
        <a-camera position="0 0 0" look-controls="enabled: false" cursor="fuse: false; rayOrigin: mouse;"></a-camera>
        ${targets}
      </a-scene>
    `;
  }

  /**
   * Conecta targetFound/targetLost de cada <a-entity> con los
   * callbacks. Como cada target tiene su propio listener independiente,
   * cualquier página se puede escanear en cualquier orden.
   */
  _attachTargetListeners() {
    SCENES.forEach((scene) => {
      const entity = this.sceneEl.querySelector(`[data-scene-id="${scene.id}"]`);
      if (!entity) return;

      entity.addEventListener("targetFound", () => {
        this.onTargetFound && this.onTargetFound(scene.id);
      });
      entity.addEventListener("targetLost", () => {
        this.onTargetLost && this.onTargetLost(scene.id);
      });
    });
  }

  /** Detiene la cámara y libera recursos de MindAR. */
  stop() {
    if (this.mindarSystem) {
      this.mindarSystem.stop();
    }
  }
}

export default ARManager;
