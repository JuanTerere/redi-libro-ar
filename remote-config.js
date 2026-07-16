/**
 * remote-config.js
 * -----------------------------------------------------------------------
 * Usa un servicio externo GRATUITO y sin registro (countapi, un
 * contador de claves/valores muy simple) para dos cosas:
 *
 *   1. Contador de jugadores (cuántas veces arrancó el juego de pesca).
 *   2. Guardar los valores que se editan desde admin.html (duración de
 *      cada intento, duración del juego final, cantidad de peces,
 *      etc.) para que apliquen a TODOS los que abran el libro después,
 *      sin tener que volver a subir código a GitHub.
 *
 * ⚠️ Ojo con esto: es un servicio de terceros, gratuito, sin garantía
 * de disponibilidad (no es nuestro, no lo controlamos). Por eso TODAS
 * las funciones de acá están armadas para fallar en silencio: si el
 * servicio está caído o tarda, el juego sigue funcionando igual con
 * los valores por defecto de config.js. Nunca debe romper la
 * experiencia de un chico jugando.
 *
 * Las claves son públicas (cualquiera que las adivine podría leerlas o
 * pisarlas) — por eso NUNCA guardamos acá nada sensible, solo números
 * de configuración del juego y un contador.
 * -----------------------------------------------------------------------
 */

const COUNTER_BASE = "https://countapi.mileshilliard.com/api/v1";

// Prefijo bien específico para no chocar con las claves de cualquier
// otro proyecto que use este mismo servicio público (es un espacio de
// claves compartido por todo internet, sin namespaces privados).
const KEY_PREFIX = "redi_juanterere_pesca_2026_";

/** Tiempo máximo que esperamos al servicio antes de rendirnos. */
const TIMEOUT_MS = 3500;

function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeout));
}

/** Lee un valor numérico guardado. Si no existe o falla, devuelve `fallback`. */
async function getRemoteValue(key, fallback) {
  try {
    const res = await fetchWithTimeout(`${COUNTER_BASE}/get/${KEY_PREFIX}${key}`);
    if (!res.ok) return fallback;
    const data = await res.json();
    const value = parseInt(data.value, 10);
    return Number.isFinite(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

/** Guarda un valor numérico. Devuelve true/false según si se pudo guardar. */
async function setRemoteValue(key, value) {
  try {
    const res = await fetchWithTimeout(
      `${COUNTER_BASE}/set/${KEY_PREFIX}${key}?value=${encodeURIComponent(value)}`
    );
    return res.ok;
  } catch {
    return false;
  }
}

/** Suma +1 a un contador y devuelve el nuevo valor (o null si falló). */
async function hitCounter(key) {
  try {
    const res = await fetchWithTimeout(`${COUNTER_BASE}/hit/${KEY_PREFIX}${key}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.value;
  } catch {
    return null;
  }
}

/** Lee un contador sin incrementarlo. Devuelve null si no existe o falló. */
async function getCounter(key) {
  try {
    const res = await fetchWithTimeout(`${COUNTER_BASE}/get/${KEY_PREFIX}${key}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.value;
  } catch {
    return null;
  }
}

/**
 * Nombres de las claves remotas que el panel de admin puede editar,
 * junto con dónde vive cada una dentro de config.js. Un solo lugar
 * para no repetir la lista en admin.js y en main.js.
 */
const EDITABLE_FIELDS = [
  { key: "attempt_duration", sceneIds: ["mar_pesca1"], field: "duration", label: "Duración del intento (segundos)" },
  { key: "game_duration", sceneIds: ["mar_pesca_feliz"], field: "gameDuration", label: "Duración del juego final (segundos)" },
  { key: "points_per_fish", sceneIds: ["mar_pesca_feliz"], field: "pointsPerFish", label: "Puntos por pez atrapado" },
  { key: "max_fish_on_screen", sceneIds: ["mar_pesca_feliz"], field: "maxFishOnScreen", label: "Cantidad máxima de peces a la vez" },
  { key: "spawn_interval_ms", sceneIds: ["mar_pesca_feliz"], field: "spawnIntervalMs", label: "Cada cuánto aparece un pez nuevo (milisegundos)" },
];

const PLAYERS_COUNTER_KEY = "players_started_game";

export {
  getRemoteValue,
  setRemoteValue,
  hitCounter,
  getCounter,
  EDITABLE_FIELDS,
  PLAYERS_COUNTER_KEY,
};
