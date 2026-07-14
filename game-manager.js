/**
 * game-manager.js
 * -----------------------------------------------------------------------
 * Controla el juego de pesca real (dentro de la escena "finale", una
 * vez que el jugador respondió bien la pregunta). Todos los peces
 * valen lo mismo (config.pointsPerFish, +10 por defecto) — usa el
 * MISMO par de imágenes de pez (pez1_a / pez1_b) para todos.
 *
 * Al arrancar, suma +1 al contador público de jugadores (servicio
 * remoto gratuito, ver remote-config.js) y lo muestra en pantalla.
 * -----------------------------------------------------------------------
 */

import FishSprite from "./fish-sprite.js";
import { hitCounter, PLAYERS_COUNTER_KEY } from "./remote-config.js";

class GameManager {
  constructor(uiManager, audioManager, analytics) {
    this.ui = uiManager;
    this.audio = audioManager;
    this.analytics = analytics;

    this.score = 0;
    this.timeLeft = 0;
    this.activeFish = [];
    this.spawnInterval = null;
    this.countdownInterval = null;
    this.container = null;
    this.config = null;
    this.running = false;
  }

  /**
   * @param {Object} config - configuración de la escena "finale" (usa
   *   gameDuration, spawnIntervalMs, maxFishOnScreen, pointsPerFish).
   * @param {HTMLElement} container
   */
  start(config, container) {
    this.config = config;
    this.container = container;
    this.score = 0;
    this.timeLeft = config.gameDuration;
    this.activeFish = [];
    this.running = true;

    this.ui.setScoreVisible(true);
    this.ui.updateScore(this.score);
    this.ui.setTimerVisible(true);
    this.ui.updateTimer(this.timeLeft);

    this.audio.play("agua");
    this.analytics.track("game_started", { duration: config.gameDuration });
    this._updatePlayersCounter();

    this.spawnInterval = setInterval(() => this._spawnFish(), config.spawnIntervalMs);
    this.countdownInterval = setInterval(() => this._tickCountdown(), 1000);

    this._spawnFish();
  }

  /** Suma +1 al contador público de jugadores y lo muestra en pantalla. */
  async _updatePlayersCounter() {
    this.ui.setPlayersVisible(true);
    const newValue = await hitCounter(PLAYERS_COUNTER_KEY);
    // Si el servicio no respondió, simplemente no mostramos el número
    // (el juego sigue funcionando igual; nunca depende de esto).
    this.ui.updatePlayersCount(newValue);
  }

  stop() {
    this.running = false;
    clearInterval(this.spawnInterval);
    clearInterval(this.countdownInterval);
    this.activeFish.forEach((fish) => fish.destroy());
    this.activeFish = [];
    this.ui.setPlayersVisible(false);
  }

  _spawnFish() {
    if (!this.running) return;
    if (this.activeFish.length >= this.config.maxFishOnScreen) return;

    const fish = new FishSprite({
      container: this.container,
      frameA: "pez1_a.svg",
      frameB: "pez1_b.svg",
      points: this.config.pointsPerFish,
      catchable: true,
      speedFactor: 0.9 + Math.random() * 0.6, // variedad de velocidad, mismo puntaje
      scale: 0.9 + Math.random() * 0.4, // variedad visual, mismo puntaje
      onCatch: (points, fishEl) => this._handleCatch(points, fishEl),
    });

    this.activeFish.push(fish);

    setTimeout(() => {
      if (this.activeFish.includes(fish)) {
        this.activeFish = this.activeFish.filter((f) => f !== fish);
        fish.destroy();
      }
    }, 6000);
  }

  _handleCatch(points, fishEl) {
    this.score += points;
    this.ui.updateScore(this.score);
    this.audio.play("captura");
    this._showFloatingPoints(points, fishEl);
    this.activeFish = this.activeFish.filter((f) => f.el !== fishEl);
    this.analytics.track("fish_caught", { points, totalScore: this.score });
  }

  _showFloatingPoints(points, fishEl) {
    const label = document.createElement("span");
    label.className = "floating-points";
    label.textContent = `+${points}`;
    label.style.left = fishEl.style.left;
    label.style.top = fishEl.style.top;
    this.container.appendChild(label);
    setTimeout(() => label.remove(), 1000);
  }

  _tickCountdown() {
    this.timeLeft -= 1;
    this.ui.updateTimer(this.timeLeft);
    if (this.timeLeft <= 0) this._endGame();
  }

  _endGame() {
    this.stop();
    this.analytics.track("game_ended", { finalScore: this.score });
    this.ui.launchConfetti();
    this.ui.showGameOver(this.score, () => this.start(this.config, this.container));
  }
}

export default GameManager;
