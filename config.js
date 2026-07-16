/**
 * config.js
 * -----------------------------------------------------------------------
 * Punto ÚNICO de configuración del libro.
 *
 * Ahora el libro usa solo DOS imágenes/marcadores en total:
 *   - "mar_pesca1"     (targetIndex 0): la página de "no se pesca
 *     nada" — está impresa en varias páginas físicas del libro, pero
 *     es la MISMA imagen en todas, así que para MindAR es un solo
 *     marcador. No importa cuál de esas páginas escanee el chico, el
 *     resultado es siempre el mismo (a propósito).
 *   - "mar_pesca_feliz" (targetIndex 1): la única página donde sí se
 *     puede pescar de verdad.
 *
 * Cualquiera de las dos se puede escanear primero, en cualquier orden
 * — cada marcador se reconoce de forma independiente.
 *
 * TIPOS DE ESCENA:
 *   "attempt" -> aparece un pez que NO se puede atrapar, corre un
 *                cronómetro corto y siempre termina en "no sacamos
 *                nada" (Redi triste).
 *   "finale"  -> pregunta SI/NO, luego quiz de opción múltiple, y si
 *                responde bien arranca el juego de pesca real.
 *
 * VALORES EDITABLES DESDE EL PANEL DE ADMIN (admin.html):
 * Los campos marcados con "// admin:" se pueden sobrescribir en
 * caliente desde el panel de administrador — ver remote-config.js.
 * -----------------------------------------------------------------------
 */

// Ruta al único archivo .mind compilado que contiene los 2 marcadores.
const MARKER_FILE = "libro.mind";

// Rutas de las dos expresiones de Redi, usadas en toda la app.
const REDI_HAPPY = "redi_saluda.png";
const REDI_SAD = "redi_triste.png";

/** Link a otro proyecto, mostrado en la pantalla de cierre/invitación. */
const EXTERNAL_LINK = {
  url: "https://juanterere.github.io/La-Gran-Carrera/",
  label: "Ingresá aquí para jugar La Gran Carrera",
};

/** Crédito fijo, visible chico abajo de toda la pantalla. */
const CREDIT = {
  text: "Producto de Matías Brizzio",
  url: "https://www.instagram.com/matias_brizzio/",
};

const SCENES = [
  {
    id: "mar_pesca1",
    targetIndex: 0,
    type: "attempt",
    duration: 10, // admin: segundos del intento
  },
  {
    id: "mar_pesca_feliz",
    targetIndex: 1,
    type: "finale",
    gateQuestion: "Hola, ¿querés ir a pescar?",
    reasonQuestion: "¿Por qué creés que ahora encontraremos peces?",
    reasonOptions: [
      { text: "Porque ahora es de día", correct: false },
      { text: "Porque Pedro lanzó mejor", correct: false },
      { text: "Porque Jesús lo dijo", correct: true },
    ],
    incorrectMessage: "No creo que esa sea una buena razón para tirar las redes de nuevo.",
    correctMessage: "Sí, es la razón correcta para seguir intentando.",
    pointsPerFish: 10, // admin: todos los peces valen lo mismo
    gameDuration: 20, // admin: segundos del juego final
    spawnIntervalMs: 800, // admin
    maxFishOnScreen: 7, // admin: cantidad de peces a la vez
  },
];

/** Devuelve la configuración de una escena a partir de su id. */
function getSceneConfig(sceneId) {
  return SCENES.find((s) => s.id === sceneId) || null;
}

/** Devuelve el índice de una escena dentro del array. */
function getSceneIndex(sceneId) {
  return SCENES.findIndex((s) => s.id === sceneId);
}

/** Devuelve la escena que corresponde a un targetIndex detectado por MindAR. */
function getSceneByTargetIndex(targetIndex) {
  return SCENES.find((s) => s.targetIndex === targetIndex) || null;
}

export {
  SCENES,
  MARKER_FILE,
  REDI_HAPPY,
  REDI_SAD,
  EXTERNAL_LINK,
  CREDIT,
  getSceneConfig,
  getSceneIndex,
  getSceneByTargetIndex,
};
