/**
 * fish-sprite.js
 * -----------------------------------------------------------------------
 * Representa un único pez animado como sprite 2D (dos imágenes que se
 * alternan cada 300ms para simular el movimiento de la cola - nada de
 * GIF). Se reutiliza en dos contextos:
 *
 *   1) Páginas "attempt" (1 a 4): un pez que SOLO nada, no reacciona
 *      al tocarlo (catchable: false, sin callbacks).
 *   2) Escena final "mar_pesca_feliz": varios peces atrapables, usando
 *      el MISMO par de imágenes pero con distinta `scale` para
 *      representar peces chicos/medianos/grandes, tal como pediste.
 * -----------------------------------------------------------------------
 */

class FishSprite {
  /**
   * @param {Object} opts
   * @param {HTMLElement} opts.container
   * @param {string} opts.frameA - ruta a la imagen del primer cuadro.
   * @param {string} opts.frameB - ruta a la imagen del segundo cuadro.
   * @param {number} opts.points - puntos que otorga si es atrapable (0 si no).
   * @param {boolean} opts.catchable - true en la escena final, false en los intentos.
   * @param {number} opts.speedFactor - multiplicador de velocidad de nado.
   * @param {number} opts.scale - escala visual (1 = tamaño base).
   * @param {Function} [opts.onCatch] - callback(points, fishElement) al atraparlo.
   * @param {Function} [opts.onEscape] - callback() cuando un pez NO atrapable
   *   es tocado (da un salto de huida rápido, pero sigue nadando).
   */
  constructor({
    container,
    frameA,
    frameB,
    points = 0,
    catchable = false,
    speedFactor = 1,
    scale = 1,
    onCatch,
    onEscape,
  }) {
    this.container = container;
    this.frameA = frameA;
    this.frameB = frameB;
    this.points = points;
    this.catchable = catchable;
    this.speedFactor = speedFactor;
    this.scale = scale;
    this.onCatch = onCatch;
    this.onEscape = onEscape;

    this.el = null;
    this._frameToggleInterval = null;
    this._swimAnimationFrame = null;
    this._alive = true;

    this._createElement();
    this._startFrameAnimation();
    this._startSwimming();
  }

  _createElement() {
    const el = document.createElement("div");
    el.className = "fish-sprite";
    el.style.setProperty("--fish-scale", this.scale);

    const startX = 10 + Math.random() * 70;
    const startY = 20 + Math.random() * 55;
    el.style.left = `${startX}%`;
    el.style.top = `${startY}%`;

    el.innerHTML = `
      <img class="fish-frame fish-frame-a" src="${this.frameA}" alt="" />
      <img class="fish-frame fish-frame-b" src="${this.frameB}" alt="" />
    `;

    // Siempre escuchamos el toque: si es atrapable, lo atrapa; si no,
    // da un salto de huida rápido pero sigue nadando (no desaparece).
    el.addEventListener("pointerdown", () => this._handleTap());
    el.style.cursor = "pointer";

    this.container.appendChild(el);
    this.el = el;

    this._facingLeft = Math.random() > 0.5;
    el.style.transform = `scale(${this.scale}) ${this._facingLeft ? "scaleX(-1)" : "scaleX(1)"}`;
  }

  _startFrameAnimation() {
    const frameA = this.el.querySelector(".fish-frame-a");
    const frameB = this.el.querySelector(".fish-frame-b");
    let showingA = true;

    this._frameToggleInterval = setInterval(() => {
      if (!this._alive) return;
      showingA = !showingA;
      frameA.style.opacity = showingA ? "1" : "0";
      frameB.style.opacity = showingA ? "0" : "1";
    }, 300);
  }

  _startSwimming() {
    let x = parseFloat(this.el.style.left);
    const baseSpeed = 0.02 * this.speedFactor;
    let direction = this._facingLeft ? -1 : 1;

    const step = () => {
      if (!this._alive) return;
      x += baseSpeed * direction;

      if (x > 85) direction = -1;
      if (x < 5) direction = 1;

      this.el.style.left = `${x}%`;
      const flip = direction === -1 ? "scaleX(-1)" : "scaleX(1)";
      this.el.style.transform = `scale(${this.scale}) ${flip}`;

      this._swimAnimationFrame = requestAnimationFrame(step);
    };
    this._swimAnimationFrame = requestAnimationFrame(step);
  }

  _handleTap() {
    if (!this._alive) return;

    if (this.catchable) {
      this._alive = false;
      this.el.classList.add("fish-caught");
      this.onCatch && this.onCatch(this.points, this.el);
      this._cleanupAfter(400);
    } else {
      // No se atrapa: da un salto rápido de huida y sigue nadando.
      this.el.classList.remove("fish-startle");
      // Forzamos reflow para poder reiniciar la animación si lo tocan
      // varias veces seguidas.
      void this.el.offsetWidth;
      this.el.classList.add("fish-startle");
      this.onEscape && this.onEscape();
    }
  }

  _cleanupAfter(ms) {
    setTimeout(() => this.destroy(), ms);
  }

  destroy() {
    this._alive = false;
    clearInterval(this._frameToggleInterval);
    cancelAnimationFrame(this._swimAnimationFrame);
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }
}

export default FishSprite;
