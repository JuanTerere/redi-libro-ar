/**
 * ui-manager.js
 * -----------------------------------------------------------------------
 * Controla todas las pantallas y tarjetas de interfaz que NO son parte
 * de la escena AR en sí: bienvenida, carga de cámara, visor submarino,
 * HUD, y las distintas tarjetas de Redi (intro de tiempo, tiempo
 * agotado, SI/NO, pregunta de opción múltiple, fin del juego).
 *
 * Todas las tarjetas comparten el mismo patrón visual (un modal con la
 * cara de Redi) para que la experiencia se sienta consistente.
 * -----------------------------------------------------------------------
 */

import { EXTERNAL_LINK, CREDIT } from "./config.js";

class UIManager {
  constructor(audioManager) {
    this.audio = audioManager;
    this.root = document.getElementById("app-root");
    this._buildStaticUI();
  }

  _buildStaticUI() {
    this.root.innerHTML = `
      <div id="screen-welcome" class="screen"></div>
      <div id="screen-loading" class="screen hidden"></div>
      <div id="viewer-overlay" class="hidden">
        <div id="viewer-frame">
          <p id="viewer-status" class="viewer-status">Buscando una página...</p>
        </div>
      </div>
      <div id="hud" class="hidden">
        <button id="btn-sound" class="hud-button" aria-label="Silenciar sonido">🔊</button>
        <div id="hud-right">
          <div id="hud-score" class="hud-pill hidden">Puntos: <span id="score-value">0</span></div>
          <div id="hud-players" class="hud-pill hidden">🎣 <span id="players-value">-</span> jugaron</div>
          <div id="hud-timer" class="hud-pill hidden"></div>
        </div>
      </div>
      <div id="toast" class="toast hidden"></div>
      <a id="credit-footer" href="${CREDIT.url}" target="_blank" rel="noopener noreferrer">${CREDIT.text}</a>
    `;

    document.getElementById("btn-sound").addEventListener("click", () => {
      const enabled = this.audio.toggle();
      document.getElementById("btn-sound").textContent = enabled ? "🔊" : "🔇";
    });
  }

  /** Pantalla 1: bienvenida de Redi. */
  showWelcome({ rediImage, onStart }) {
    const screen = document.getElementById("screen-welcome");
    screen.classList.remove("hidden");
    screen.innerHTML = `
      <div class="welcome-card">
        <img src="${rediImage}" alt="Redi saludando" class="redi-portrait" />
        <h1>¡Hola! Soy Redi</h1>
        <p>Hoy es un gran día para pescar.<br />¿Me acompañás?</p>
        <button id="btn-empezar" class="btn-primary">¡Vamos! 🎣</button>
      </div>
    `;
    document.getElementById("btn-empezar").addEventListener("click", () => {
      screen.classList.add("hidden");
      onStart();
    });
  }

  showLoading(text = "Preparando la cámara...") {
    const screen = document.getElementById("screen-loading");
    screen.classList.remove("hidden");
    screen.innerHTML = `
      <div class="loading-card">
        <div class="loading-bubbles"><span></span><span></span><span></span></div>
        <p>${text}</p>
      </div>
    `;
  }

  hideLoading() {
    document.getElementById("screen-loading").classList.add("hidden");
  }

  showViewer() {
    document.getElementById("viewer-overlay").classList.remove("hidden");
    document.getElementById("hud").classList.remove("hidden");
    this.setViewerStatus("Buscando una página...");
  }

  hideViewer() {
    document.getElementById("viewer-overlay").classList.add("hidden");
  }

  setViewerStatus(text) {
    document.getElementById("viewer-status").textContent = text;
  }

  showToast(text, durationMs = 1600) {
    const toast = document.getElementById("toast");
    toast.textContent = text;
    toast.classList.remove("hidden");
    toast.classList.add("toast-visible");
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove("toast-visible");
      toast.classList.add("hidden");
    }, durationMs);
  }

  setScoreVisible(visible) {
    document.getElementById("hud-score").classList.toggle("hidden", !visible);
  }

  updateScore(value) {
    document.getElementById("score-value").textContent = value;
  }

  setTimerVisible(visible) {
    document.getElementById("hud-timer").classList.toggle("hidden", !visible);
  }

  updateTimer(seconds) {
    document.getElementById("hud-timer").textContent = `⏱ ${seconds}s`;
  }

  /** Contador visible de "cuánta gente jugó este juego". */
  setPlayersVisible(visible) {
    document.getElementById("hud-players").classList.toggle("hidden", !visible);
  }

  updatePlayersCount(value) {
    document.getElementById("players-value").textContent = value ?? "-";
  }

  /**
   * Tarjeta genérica de Redi con un único botón de acción, y
   * opcionalmente un segundo botón que redirige a un link externo
   * (por ejemplo, en la pantalla de despedida).
   */
  showActionCard({ rediImage, title, message, buttonLabel, onAction, link }) {
    const modal = document.createElement("div");
    modal.className = "redi-modal";
    modal.innerHTML = `
      <div class="redi-card">
        <img src="${rediImage}" alt="Redi" class="redi-portrait" />
        ${title ? `<h2>${title}</h2>` : ""}
        <p>${message}</p>
        <button class="btn-primary btn-action">${buttonLabel}</button>
        ${link ? `<a class="btn-secondary btn-link" href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label}</a>` : ""}
      </div>
    `;
    this.root.appendChild(modal);
    modal.querySelector(".btn-action").addEventListener("click", () => {
      modal.remove();
      onAction();
    });
    return modal;
  }

  /** Alias semántico usado por attempt-manager.js. */
  showTimeIntroCard(opts) {
    return this.showActionCard({
      rediImage: opts.rediImage,
      message: opts.message,
      buttonLabel: opts.buttonLabel,
      onAction: opts.onStart,
    });
  }

  /** Alias semántico usado por attempt-manager.js. */
  showTimeoutCard(opts) {
    return this.showActionCard({
      rediImage: opts.rediImage,
      title: opts.title,
      message: opts.message,
      buttonLabel: opts.buttonLabel,
      onAction: opts.onContinue,
    });
  }

  /** Tarjeta con dos botones: SI / NO. */
  showYesNoCard({ rediImage, message, yesLabel = "Sí", noLabel = "No", onYes, onNo }) {
    const modal = document.createElement("div");
    modal.className = "redi-modal";
    modal.innerHTML = `
      <div class="redi-card">
        <img src="${rediImage}" alt="Redi" class="redi-portrait" />
        <h2>${message}</h2>
        <div class="yesno-buttons">
          <button class="btn-primary btn-yes">${yesLabel}</button>
          <button class="btn-secondary btn-no">${noLabel}</button>
        </div>
      </div>
    `;
    this.root.appendChild(modal);
    modal.querySelector(".btn-yes").addEventListener("click", () => {
      modal.remove();
      onYes();
    });
    modal.querySelector(".btn-no").addEventListener("click", () => {
      modal.remove();
      onNo();
    });
    return modal;
  }

  /**
   * Pregunta de opción múltiple con cara de Redi.
   *  - Si responde MAL: la tarjeta cambia de contenido (Redi triste +
   *    el mensaje de error + un botón "Volver") en vez de dejar las
   *    opciones abiertas para reintentar ahí mismo.
   *  - Si responde BIEN: muestra el mensaje de acierto y después
   *    avisa mediante el callback para que arranque el juego.
   */
  showReasonQuiz({ rediHappy, rediSad, question, options, incorrectMessage, correctMessage, onIncorrect, onCorrect }) {
    const modal = document.createElement("div");
    modal.className = "redi-modal";
    modal.innerHTML = `
      <div class="redi-card">
        <img src="${rediHappy}" alt="Redi" class="redi-portrait" />
        <h2>${question}</h2>
        <div class="quiz-options">
          ${options
            .map((opt, i) => `<button class="quiz-option" data-index="${i}">${opt.text}</button>`)
            .join("")}
        </div>
      </div>
    `;
    this.root.appendChild(modal);
    const card = modal.querySelector(".redi-card");

    modal.querySelectorAll(".quiz-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index, 10);
        const correct = options[index].correct;

        if (correct) {
          card.innerHTML = `
            <img src="${rediHappy}" alt="Redi" class="redi-portrait" />
            <p>${correctMessage}</p>
          `;
          onCorrect(() => modal.remove());
        } else {
          card.innerHTML = `
            <img src="${rediSad}" alt="Redi" class="redi-portrait" />
            <p>${incorrectMessage}</p>
            <button class="btn-secondary btn-back">Volver</button>
          `;
          card.querySelector(".btn-back").addEventListener("click", () => {
            modal.remove();
            onIncorrect();
          });
        }
      });
    });
  }

  /** Pantalla final del mini-juego: puntaje + volver a jugar + cierre/invitación. */
  showGameOver(finalScore, onReplay) {
    const modal = document.createElement("div");
    modal.className = "gameover-modal";
    modal.innerHTML = `
      <div class="gameover-card">
        <h2>¡Excelente pesca! 🐟</h2>
        <p>Puntos totales: <strong>${finalScore}</strong></p>
        <button class="btn-primary btn-replay">Volver a jugar</button>
        <hr class="card-divider" />
        <p class="closing-message">Redi Redex dice: Gracias por ir a pescar conmigo. Espero que lo hayas disfrutado tanto como yo.</p>
        <a class="btn-secondary btn-link" href="${EXTERNAL_LINK.url}" target="_blank" rel="noopener noreferrer">${EXTERNAL_LINK.label}</a>
      </div>
    `;
    this.root.appendChild(modal);
    modal.querySelector(".btn-replay").addEventListener("click", () => {
      modal.remove();
      onReplay();
    });
  }

  /**
   * Pantalla de cierre/invitación: se usa cuando el jugador dice que
   * NO quiere ir a pescar. Misma cara feliz de Redi que en la
   * bienvenida (no la triste), con el link a "La Gran Carrera".
   */
  showClosingScreen({ rediImage, onAction }) {
    return this.showActionCard({
      rediImage,
      message: "Redi Redex dice: Gracias por ir a pescar conmigo. Espero que lo hayas disfrutado tanto como yo.",
      buttonLabel: "Buscar otra página",
      link: EXTERNAL_LINK,
      onAction,
    });
  }

  launchConfetti() {
    const container = document.createElement("div");
    container.className = "confetti-container";
    const colors = ["#0EA5C4", "#FDE68A", "#C68B59", "#F97362", "#ffffff"];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = `${Math.random() * 0.6}s`;
      piece.style.animationDuration = `${1.8 + Math.random() * 1.2}s`;
      container.appendChild(piece);
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 3200);
  }
}

export default UIManager;
