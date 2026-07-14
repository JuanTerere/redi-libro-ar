/**
 * bubble-sprite.js
 * -----------------------------------------------------------------------
 * Burbuja individual que sube desde abajo hacia arriba de la pantalla y
 * alterna entre dos cuadros (bubija_1 / bubija_2) para dar sensación de
 * movimiento, igual que los peces pero en vertical. Es la única
 * decoración ambiental que piden las escenas "attempt" (sin algas).
 * -----------------------------------------------------------------------
 */

class BubbleSprite {
  /**
   * @param {Object} opts
   * @param {HTMLElement} opts.container
   * @param {string} opts.frameA - ruta a bubija_1
   * @param {string} opts.frameB - ruta a bubija_2
   * @param {Function} [opts.onComplete] - callback al llegar arriba (para reciclar la burbuja).
   */
  constructor({ container, frameA, frameB, onComplete }) {
    this.container = container;
    this.frameA = frameA;
    this.frameB = frameB;
    this.onComplete = onComplete;

    this.el = null;
    this._frameToggleInterval = null;
    this._riseTimeout = null;
    this._alive = true;

    this._createElement();
    this._startFrameAnimation();
  }

  _createElement() {
    const el = document.createElement("div");
    el.className = "bubble-sprite";

    const size = 14 + Math.random() * 18; // px, variedad de tamaños
    const left = Math.random() * 100;
    const duration = 4 + Math.random() * 4; // segundos para subir

    el.style.left = `${left}%`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.animationDuration = `${duration}s`;

    el.innerHTML = `
      <img class="bubble-frame bubble-frame-a" src="${this.frameA}" alt="" />
      <img class="bubble-frame bubble-frame-b" src="${this.frameB}" alt="" />
    `;

    this.container.appendChild(el);
    this.el = el;

    // Dispara la animación de subida en el siguiente frame (para que la
    // transición CSS se aplique correctamente) y limpia al terminar.
    requestAnimationFrame(() => el.classList.add("bubble-rising"));
    this._riseTimeout = setTimeout(() => {
      this.destroy();
      this.onComplete && this.onComplete();
    }, duration * 1000);
  }

  _startFrameAnimation() {
    const frameA = this.el.querySelector(".bubble-frame-a");
    const frameB = this.el.querySelector(".bubble-frame-b");
    let showingA = true;

    this._frameToggleInterval = setInterval(() => {
      if (!this._alive) return;
      showingA = !showingA;
      frameA.style.opacity = showingA ? "1" : "0";
      frameB.style.opacity = showingA ? "0" : "1";
    }, 350);
  }

  destroy() {
    this._alive = false;
    clearInterval(this._frameToggleInterval);
    clearTimeout(this._riseTimeout);
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }
}

export default BubbleSprite;
