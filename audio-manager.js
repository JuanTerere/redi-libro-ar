/**
 * audio-manager.js
 * -----------------------------------------------------------------------
 * Maneja todos los efectos de sonido del libro.
 * Los sonidos son opcionales y el usuario puede silenciarlos con un
 * botón permanente en pantalla. El estado se guarda en memoria (no en
 * localStorage, para mantener el proyecto simple y sin dependencias).
 * -----------------------------------------------------------------------
 */

class AudioManager {
  constructor() {
    this.enabled = true;
    this.sounds = {};
    this._registerSounds();
  }

  /**
   * Registra todos los efectos de sonido disponibles.
   * Si falta un archivo de audio, el juego sigue funcionando en silencio
   * para ese efecto (no rompe la experiencia).
   */
  _registerSounds() {
    const files = {
      agua: "agua.mp3",
      burbujas: "burbujas.mp3",
      captura: "captura.mp3",
      correcto: "correcto.mp3",
      incorrecto: "incorrecto.mp3",
      escape: "escape.mp3",
    };

    for (const [key, path] of Object.entries(files)) {
      const audio = new Audio(path);
      audio.preload = "none"; // no cargar hasta que se necesite (ahorra memoria/batería)
      audio.volume = 0.8;
      this.sounds[key] = audio;
    }
  }

  /** Reproduce un efecto de sonido por nombre, si el audio está habilitado. */
  play(name) {
    if (!this.enabled) return;
    const sound = this.sounds[name];
    if (!sound) return;

    // Clonamos el nodo para permitir sonidos superpuestos (p. ej. varios
    // peces atrapados rápido) sin cortar la reproducción anterior.
    const instance = sound.cloneNode();
    instance.volume = sound.volume;
    instance.play().catch(() => {
      /* Algunos navegadores bloquean autoplay hasta la primera interacción
         del usuario; se ignora silenciosamente ya que el sonido es opcional. */
    });
  }

  /** Activa o desactiva todo el audio del libro. */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

export default AudioManager;
