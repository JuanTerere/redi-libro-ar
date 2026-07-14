/**
 * config.js
 * -----------------------------------------------------------------------
 * Punto ÚNICO de configuración del libro.
 * Para agregar una página nueva en el futuro, alcanza con agregar un
 * objeto nuevo al array SCENES. Ningún otro archivo necesita cambiar.
 *
 * IMPORTANTE SOBRE LOS MARCADORES:
 * MindAR no soporta tener varios archivos .mind corriendo al mismo
 * tiempo dentro de una sola escena AR. El flujo correcto es compilar
 * TODAS las imágenes de página juntas, de una sola vez, con:
 *   https://hiukim.github.io/mind-ar-js-doc/tools/compile
 * Eso genera UN solo archivo (MARKER_FILE, más abajo) que contiene
 * todos los marcadores. Cada imagen que subís a esa herramienta recibe
 * un índice (targetIndex) según el orden en que la subiste. Cambiar el
 * `id` de una escena (el nombre que usamos en el código) NO afecta esa
 * numeración: targetIndex sigue dependiendo únicamente del orden de
 * compilación del .mind.
 *
 * TIPOS DE ESCENA:
 *   "attempt" -> mar_pesca1 a mar_pesca4: aparece un pez que NO se
 *                puede atrapar, corre un cronómetro corto y siempre
 *                termina en "no sacamos nada" (Redi triste).
 *   "finale"  -> página "mar_pesca_feliz": pregunta SI/NO, luego quiz
 *                de opción múltiple, y si responde bien arranca el
 *                juego de pesca real con puntaje.
 *
 * VALORES EDITABLES DESDE EL PANEL DE ADMIN (admin.html):
 * Los campos marcados con "// admin:" más abajo se pueden sobrescribir
 * en caliente desde el panel de administrador, sin volver a subir
 * código — ver remote-config.js para el detalle de cómo funciona eso.
 * -----------------------------------------------------------------------
 */

// Ruta al único archivo .mind compilado que contiene TODOS los marcadores.
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
    id: "mar_pesca2",
    targetIndex: 1,
    type: "attempt",
    duration: 10, // admin
  },
  {
    id: "mar_pesca3",
    targetIndex: 2,
    type: "attempt",
    duration: 10, // admin
  },
  {
    id: "mar_pesca4",
    targetIndex: 3,
    type: "attempt",
    duration: 10, // admin
  },
  {
    id: "mar_pesca_feliz",
    targetIndex: 4,
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

/** Devuelve el índice de una escena dentro del array (orden lineal del libro). */
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
