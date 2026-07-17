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
    this.activeLoops = {}; // Para llevar registro de sonidos que se reproducen en bucle
    this._registerSounds();
  }

  /**
   * Registra todos los efectos de sonido disponibles.
   * Si falta un archivo de audio, el juego sigue funcionando en silencio
   * para ese efecto (no rompe la experiencia).
   */
  _registerSounds() {
    const files = {
      agua: "agua.mp3", // Sonido ambiente de fondo (bucle continuo bajo el agua)
      burbujas: "burbujas.mp3", // Se activa al tocar una burbuja
      captura: "auch.mp3", // Se activa cuando atrapan un pez (sonido de ¡auch!)
      no_pesca: "sonido-no.mp3", // <-- Agregamos el sonido del pez que no se puede pescar
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

  /** Reproduce un efecto de sonido corto por nombre (con opción de superposición). */
  play(name) {
    if (!this.enabled) return;
    const sound = this.sounds[name];
    if (!sound) return;

    // Para sonidos normales, los clonamos para que se puedan superponer
    const instance = sound.cloneNode();
    instance.volume = sound.volume;
    instance.play().catch(() => {
      /* Algunos navegadores bloquean autoplay hasta la primera interacción; se ignora */
    });
  }

  /** 
   * Inicia la reproducción en bucle (loop) de un sonido (ej: "agua").
   * Ideal para sonidos de fondo continuos.
   */
  startLoop(name) {
    const sound = this.sounds[name];
    if (!sound) return;

    // Si ya se está reproduciendo este loop, no iniciamos otro encima
    if (this.activeLoops[name]) return;

    sound.loop = true;
    this.activeLoops[name] = sound;

    if (this.enabled) {
      sound.play().catch(() => {
        /* Se ignora si el navegador restringe la interacción inicial */
      });
    }
  }

  /** Detiene un sonido específico que está en reproducción continua (bucle). */
  stopLoop(name) {
    const sound = this.activeLoops[name];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
      delete this.activeLoops[name];
    }
  }

  /** Activa o desactiva todo el audio del libro. */
  toggle() {
    this.enabled = !this.enabled;
    
    // Si desactivamos, pausamos todos los loops activos
    if (!this.enabled) {
      for (const sound of Object.values(this.activeLoops)) {
        sound.pause();
      }
    } else {
      // Si reactivamos, reanudamos los loops activos
      for (const sound of Object.values(this.activeLoops)) {
        sound.play().catch(() => {});
      }
    }
    
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

export default AudioManager;
