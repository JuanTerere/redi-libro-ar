/**
 * fish-sprite.js
 * -----------------------------------------------------------------------
 * Representa un único pez animado como sprite 2D (dos imágenes que se
 * alternan cada 300ms para simular el movimiento de la cola - nada de
 * GIF). Soporta dos modos de movimiento:
 *
 *   "cruise" -> usado en la página de intento (mar_pesca1): el pez
 *      entra nadando desde un costado de la pantalla, cruza en línea
 *      recta y sale por el otro lado. Si lo tocan (no es atrapable),
 *      acelera y sigue de largo hasta desaparecer — nunca se atrapa,
 *      solo se escapa. Cuando sale de pantalla (solo o por huir),
 *      avisa mediante `onExit` para que quien lo creó pueda hacer
 *      entrar al siguiente.
 *
 *   "wander" -> usado en el juego real (mar_pesca_feliz): el pez
 *      deambula rebotando dentro del área visible. Si lo tocan y es
 *      atrapable, se atrapa y desaparece (comportamiento sin cambios).
 * -----------------------------------------------------------------------
 */

class FishSprite {
  /**
   * @param {Object} opts
   * @param {HTMLElement} opts.container
   * @param {string} opts.frameA - ruta a la imagen del primer cuadro.
   * @param {string} opts.frameB - ruta a la imagen del segundo cuadro.
   * @param {"cruise"|"wander"} [opts.mode="wander"] - patrón de movimiento.
   * @param {number} opts.points - puntos que otorga si es atrapable (0 si no).
   * @param {boolean} opts.catchable - true en la escena final, false en los intentos.
   * @param {number} opts.speedFactor - multiplicador de velocidad de nado.
   * @param {number} opts.scale - escala visual (1 = tamaño base).
   * @param {Function} [opts.onCatch] - callback(points, fishElement) al atraparlo.
   * @param {Function} [opts.onEscape] - callback() cuando tocan un pez no
   *   atrapable (para el sonido de "se escapó", por ejemplo).
   * @param {Function} [opts.onExit] - (solo modo "cruise") callback() cuando
   *   el pez sale de pantalla, solo o porque lo asustaron.
   */
  constructor({
    container,
    frameA,
    frameB,
    mode = "wander",
    points = 0,
    catchable = false,
    speedFactor = 1,
    scale = 1,
    onCatch,
    onEscape,
    onExit,
  }) {
    this.container = container;
    this.frameA = frameA;
    this.frameB = frameB;
    this.mode = mode;
    this.points = points;
    this.catchable = catchable;
    this.speedFactor = speedFactor;
    this.scale = scale;
    this.onCatch = onCatch;
    this.onEscape = onEscape;
    this.onExit = onExit;

    this.el = null;
    this._frameToggleInterval = null;
    this._swimAnimationFrame = null;
    this._alive = true;
    this._fleeing = false;

    this._createElement();
    this._startFrameAnimation();
    if (this.mode === "cruise") {
      this._startCruising();
    } else {
      this._startWandering();
    }
  }

  _createElement() {
    const el = document.createElement("div");
    el.className = "fish-sprite";
    el.style.setProperty("--fish-scale", this.scale);

    el.innerHTML = `
      <img class="fish-frame fish-frame-a" src="${this.frameA}" alt="" />
      <img class="fish-frame fish-frame-b" src="${this.frameB}" alt="" />
    `;

    el.addEventListener("pointerdown", () => this._handleTap());
    el.style.cursor = "pointer";

    this.container.appendChild(el);
    this.el = el;
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

  /** Modo "wander": deambula rebotando dentro del área visible (juego real). */
  _startWandering() {
    const startX = 10 + Math.random() * 70;
    const startY = 20 + Math.random() * 55;
    this.el.style.top = `${startY}%`;

    let x = startX;
    this.el.style.left = `${x}%`;
    let direction = Math.random() > 0.5 ? -1 : 1;
    this._applyFacing(direction);

    const baseSpeed = 0.02 * this.speedFactor;

    const step = () => {
      if (!this._alive) return;
      x += baseSpeed * direction;

      if (x > 85) direction = -1;
      if (x < 5) direction = 1;

      this.el.style.left = `${x}%`;
      this._applyFacing(direction);

      this._swimAnimationFrame = requestAnimationFrame(step);
    };
    this._swimAnimationFrame = requestAnimationFrame(step);
  }

  /** Modo "cruise": entra por un costado, cruza, sale por el otro. */
  _startCruising() {
    const fromLeft = Math.random() > 0.5;
    const direction = fromLeft ? 1 : -1;
    let x = fromLeft ? -20 : 120;
    const y = 25 + Math.random() * 45;

    this.el.style.top = `${y}%`;
    this.el.style.left = `${x}%`;
    this._applyFacing(direction);

    const baseSpeed = 0.22 * this.speedFactor; // % por frame

    const step = () => {
      if (!this._alive) return;
      const currentSpeed = this._fleeing ? baseSpeed * 3 : baseSpeed;
      x += currentSpeed * direction;
      this.el.style.left = `${x}%`;

      if (x < -25 || x > 125) {
        // Salió de pantalla, solo o huyendo: se acabó su recorrido.
        this._alive = false;
        this.onExit && this.onExit();
        this.destroy();
        return;
      }

      this._swimAnimationFrame = requestAnimationFrame(step);
    };
    this._swimAnimationFrame = requestAnimationFrame(step);
  }

  _applyFacing(direction) {
    const flip = direction === -1 ? "scaleX(-1)" : "scaleX(1)";
    this.el.style.transform = `scale(${this.scale}) ${flip}`;
  }

  _handleTap() {
    if (!this._alive) return;

    if (this.catchable) {
      this._alive = false;
      this.el.classList.add("fish-caught");
      this.onCatch && this.onCatch(this.points, this.el);
      this._cleanupAfter(400);
      return;
    }

    if (this.mode === "cruise") {
      // No se atrapa: acelera y sigue de largo hasta salir de pantalla.
      if (this._fleeing) return; // ya está escapando, no reiniciar
      this._fleeing = true;
      this.el.classList.add("fish-startle");
      this.onEscape && this.onEscape();
    } else {
      // Modo wander no atrapable (no se usa actualmente, pero se deja
      // el comportamiento de escape breve en el lugar por consistencia).
      this.el.classList.remove("fish-startle");
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
