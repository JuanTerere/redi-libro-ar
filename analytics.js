/**
 * analytics.js
 * -----------------------------------------------------------------------
 * ETAPA 1: este módulo solo junta los eventos importantes del juego en
 * un único lugar y los guarda en memoria (además de loguearlos en
 * consola). Todavía NO manda nada a ningún servidor.
 *
 * ETAPA 2 (panel de control con estadísticas compartidas): cuando
 * conectemos el backend gratuito (por ejemplo Firebase), el ÚNICO
 * cambio necesario va a ser reemplazar el cuerpo de `_persist()` para
 * que además de guardar en memoria, haga un `push`/`set` a la base de
 * datos. Ningún otro archivo del juego necesita cambiar, porque todos
 * ya reportan sus eventos a través de `track()`.
 *
 * Eventos que ya se reportan desde el resto del código:
 *   session_start          - se abrió el libro
 *   attempt_started        - arrancó un intento (páginas 1-4)
 *   attempt_timeout         - se acabó el tiempo sin atrapar nada
 *   finale_gate_answered      - respondió SI/NO a "¿tiramos las redes?"
 *   finale_quiz_answered        - respondió la pregunta de opción múltiple
 *   game_started                   - arrancó el juego final
 *   fish_caught                       - atrapó un pez (con su puntaje)
 *   game_ended                          - terminó el juego final (con puntaje total)
 * -----------------------------------------------------------------------
 */

class Analytics {
  constructor() {
    this.sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.events = [];
  }

  /** Registra un evento con su información asociada. */
  track(eventName, data = {}) {
    const event = {
      sessionId: this.sessionId,
      eventName,
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.events.push(event);
    this._persist(event);
  }

  /**
   * ETAPA 1: guarda en memoria y loguea. ETAPA 2: acá se agrega el
   * envío al backend gratuito elegido (Firebase Realtime Database o
   * Firestore, ambos con plan gratuito suficiente para este proyecto).
   */
  _persist(event) {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event.eventName, event);
    // TODO (etapa 2): reemplazar por, por ejemplo:
    //   import { getDatabase, ref, push } from "firebase/database";
    //   push(ref(getDatabase(), "eventos"), event);
  }

  /** Devuelve todos los eventos juntados en esta sesión (útil para debug). */
  getSessionEvents() {
    return [...this.events];
  }
}

export default Analytics;
