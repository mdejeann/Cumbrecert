// Definición de los nudos del minijuego 3D (sin dependencia de three.js).
// Unidades de escena: el lomo del mosquetón es el eje Y en x = 0, z = 0.
// +z mira hacia la cámara (adelante), -z es "por detrás".

export type KnotId = "ocho" | "dinamico" | "ballestrinque";
export type Vec = [number, number, number];
// Un paso es un punto por el que pasa el chicote, o una acción sobre el gatillo
export type KnotStep = {
  at?: Vec;
  gate?: "open" | "close" | "lock";
  // Modo guiado: empujar la cuerda por una secuencia de fotogramas clave arrastrando un punto.
  // gateAt: hasta dónde llega con el gatillo cerrado; autoCloseAt: el resorte cierra el gatillo
  // cuando la cuerda ya pasó; then: forma a la que pasa sola al terminar
  push?: { path: number[]; dir: "derecha" | "izquierda"; handle: number; gateAt?: number; autoCloseAt?: number; then?: number };
  hint: string;
};

// Modo guiado (dinámico): la cuerda pasa por formas predefinidas como en la figura del manual
export type Staged = {
  keyframes: Vec[][]; // todas con la misma cantidad de puntos de control
  flip: Vec[]; // el nudo "dado vuelta" al tirar del otro lado
  hitch: [number, number]; // tramo de puntos que forma el nudo (el que se da vuelta)
};

export type KnotDef = {
  nombre: string;
  objetivo: string;
  carabiner: boolean;
  firme: Vec[]; // tramo fijo desde el anclaje; el último punto es donde arranca el chicote
  steps: KnotStep[];
  ajuste: string; // indicación de la fase de ajuste
  pull: Vec; // hacia dónde conviene tirar para ajustar
  target: Vec; // hacia dónde mira la cámara
  staged?: Staged;
};

const CARABINER_FIRME: Vec[] = [
  [-3.2, -2.45, 0.9],
  [-1.6, -1.7, 0.6],
  [-0.6, -1.05, 0.38],
  [-0.3, -0.85, 0.34],
];

export const KNOTS: Record<KnotId, KnotDef> = {
  ballestrinque: {
    nombre: "Nudo ballestrinque",
    objetivo: "Dos vueltas cruzadas alrededor del lomo del mosquetón.",
    carabiner: true,
    firme: CARABINER_FIRME,
    steps: [
      { gate: "open", hint: "Abrí el gatillo del mosquetón: tocalo o usá el botón «Abrir gatillo»." },
      { at: [0, -0.6, 0.32], hint: "Pasá la cuerda por delante del lomo del mosquetón." },
      { at: [0.34, -0.55, 0], hint: "Entrá al mosquetón." },
      { at: [0, -0.5, -0.34], hint: "Rodeá el lomo por detrás. Girá la cámara arrastrando el fondo para verlo." },
      { at: [-0.34, -0.42, 0], hint: "Salí por la izquierda del lomo." },
      { at: [0, -0.12, 0.34], hint: "Cruzá en diagonal por delante, hacia arriba." },
      { at: [0.34, 0.08, 0], hint: "Segunda vuelta: entrá otra vez al mosquetón." },
      { at: [0, 0.14, -0.34], hint: "Otra vez por detrás del lomo." },
      { at: [-0.34, 0.16, 0], hint: "Salí por la izquierda." },
      { at: [0.06, -0.3, 0.2], hint: "Pasá el chicote por debajo del cruce diagonal." },
      { gate: "close", hint: "Cerrá el gatillo y enroscá el seguro antes de cargar el nudo." },
    ],
    ajuste: "Tirá del chicote hacia abajo para peinar y ajustar las dos vueltas.",
    pull: [0.6, -2.2, 0.6],
    target: [0.2, -0.3, 0],
  },
  dinamico: {
    nombre: "Nudo dinámico (UIAA)",
    objetivo: "Como en la figura 22 del manual: gaza al mosquetón, segunda gaza y probar que corre para los dos lados.",
    carabiner: true,
    firme: CARABINER_FIRME,
    steps: [
      { gate: "open", hint: "1. Abrí el gatillo del mosquetón HMS: tocalo o usá el botón «Abrir gatillo»." },
      {
        push: { path: [0, 4, 5, 1], dir: "derecha", handle: 6, gateAt: 0.36, autoCloseAt: 0.7, then: 2 },
        hint: "2. Agarrá la gaza (punto verde) y llevala de izquierda a derecha: entra por la abertura del gatillo.",
      },
      { gate: "open", hint: "3. Se formó la segunda gaza. Volvé a abrir el gatillo." },
      {
        push: { path: [2, 6, 3], dir: "izquierda", handle: 11, gateAt: 0.08, autoCloseAt: 0.55 },
        hint: "4. Empujá la segunda gaza de derecha a izquierda para meterla por la abertura del gatillo.",
      },
      { gate: "lock", hint: "5. Enroscá el seguro: nunca uses el dinámico con el seguro abierto." },
    ],
    ajuste: "Probá que sea dinámico: tirá de un extremo y del otro (puntos verdes abajo). La cuerda corre y el nudo se da vuelta.",
    pull: [-1.6, -2.2, 0.6],
    target: [0.45, -1.3, 0],
    staged: {
      keyframes: [
        // 0: la cuerda con la primera gaza armada, a la izquierda del mosquetón
        [
          [0.12, -2.45, 0.32], [0.0, -2.15, 0.32], [-0.25, -1.8, 0.3], [-0.45, -1.5, 0.25], [-0.55, -1.3, 0.2], [-0.5, -1.15, 0.15], [-0.38, -1.1, 0.08], [-0.42, -1.2, 0.0], [-0.55, -1.4, -0.05], [-0.6, -1.65, -0.08], [-0.55, -1.9, -0.1], [-0.45, -2.1, -0.12], [-0.35, -2.3, -0.12], [-0.3, -2.45, -0.12],
        ],
        // 1: la primera gaza ya rodea la barra ancha (primera imagen)
        [
          [0.12, -2.45, 0.32], [0.16, -2.05, 0.3], [0.35, -1.89, 0.225], [0.25, -1.58, 0.218], [0.22, -1.284, 0.191], [0.23, -1.214, -0.07], [0.26, -1.457, -0.269], [0.32, -1.735, -0.14], [0.37, -1.903, -0.035], [0.3, -2.0, -0.3], [0.25, -2.15, -0.3], [0.2, -2.25, -0.3], [0.18, -2.35, -0.3], [0.15, -2.45, -0.3],
        ],
        // 2: segunda gaza torcida, afuera a la derecha (segunda imagen)
        [
          [0.12, -2.45, 0.32], [0.16, -2.05, 0.3], [0.35, -1.89, 0.225], [0.25, -1.58, 0.218], [0.22, -1.284, 0.191], [0.23, -1.214, -0.07], [0.26, -1.457, -0.269], [0.32, -1.735, -0.14], [0.43, -1.731, 0.038], [0.6, -1.85, 0.25], [1.15, -1.6, 0.3], [1.2, -1.0, 0.15], [0.95, -1.25, 0.35], [0.75, -2.45, 0.4],
        ],
        // 3: dinámico terminado, como la foto: dos vueltas lado a lado y el collar en el medio
        [
          [0.12, -2.45, 0.32], [0.16, -2.05, 0.3], [0.35, -1.89, 0.225], [0.25, -1.58, 0.218], [0.22, -1.284, 0.191], [0.23, -1.214, -0.07], [0.26, -1.457, -0.269], [0.32, -1.735, -0.14], [0.39, -1.631, 0.086], [0.55, -1.556, 0.261], [0.65, -1.239, 0.174], [0.67, -1.181, -0.092], [0.63, -1.503, -0.276], [0.72, -2.45, 0.1],
        ],
        // 4: la gaza pasa por delante y queda frente a la abertura del gatillo
        [
          [0.12, -2.45, 0.32], [0.2, -2.1, 0.32], [0.4, -1.85, 0.3], [0.65, -1.6, 0.28], [0.88, -1.35, 0.25], [1.05, -1.05, 0.18], [1.12, -0.85, 0.05], [1.05, -1.0, -0.12], [0.9, -1.35, -0.2], [0.7, -1.6, -0.25], [0.5, -1.85, -0.28], [0.35, -2.05, -0.3], [0.25, -2.25, -0.3], [0.2, -2.45, -0.3],
        ],
        // 5: la gaza entró por la abertura: un tramo adelante y otro atrás del mosquetón
        [
          [0.12, -2.45, 0.32], [0.2, -2.1, 0.32], [0.4, -1.85, 0.3], [0.65, -1.6, 0.28], [0.88, -1.35, 0.25], [1.05, -1.05, 0.18], [0.65, -1.12, 0.0], [1.05, -1.0, -0.12], [0.9, -1.35, -0.2], [0.7, -1.6, -0.25], [0.5, -1.85, -0.28], [0.35, -2.05, -0.3], [0.25, -2.25, -0.3], [0.2, -2.45, -0.3],
        ],
        // 6: la segunda gaza pasando por la abertura del gatillo
        [
          [0.12, -2.45, 0.32], [0.16, -2.05, 0.3], [0.35, -1.89, 0.225], [0.25, -1.58, 0.218], [0.22, -1.284, 0.191], [0.23, -1.214, -0.07], [0.26, -1.457, -0.269], [0.32, -1.735, -0.14], [0.43, -1.731, 0.038], [0.75, -1.7, 0.25], [1.05, -1.2, 0.22], [0.66, -1.1, 0.0], [0.98, -1.05, -0.2], [0.75, -2.45, 0.35],
        ],
      ],
      // El mismo nudo dado vuelta (cuando se tira del otro extremo): el collar pasa al otro lado
      flip: [
        [0.12, -2.45, 0.32], [0.16, -2.05, 0.3], [0.55, -1.876, 0.225], [0.65, -1.547, 0.218], [0.68, -1.244, 0.191], [0.67, -1.174, -0.07], [0.64, -1.427, -0.269], [0.58, -1.718, -0.14], [0.51, -1.621, 0.086], [0.35, -1.57, 0.261], [0.25, -1.272, 0.174], [0.23, -1.221, -0.092], [0.27, -1.531, -0.276], [0.72, -2.45, 0.1],
      ],
      hitch: [3, 12],
    },
  },
  ocho: {
    nombre: "Nudo de ocho",
    objetivo: "Formá el ocho alrededor del firme y ajustalo.",
    carabiner: false,
    firme: [
      [0, 3.4, 0],
      [0, 1.2, 0],
      [0, -0.35, 0],
      [0.05, -0.55, 0.12],
    ],
    steps: [
      { at: [0.38, -0.25, 0.12], hint: "Formá un seno hacia la derecha." },
      { at: [0, 0.22, 0.3], hint: "Cruzá el chicote por delante del firme." },
      { at: [-0.38, 0.48, 0.05], hint: "Seguí subiendo por la izquierda." },
      { at: [0, 0.74, -0.3], hint: "Rodeá el firme por detrás (girá la cámara)." },
      { at: [0.38, 0.5, 0], hint: "Bajá por la derecha." },
      { at: [0.16, 0.02, -0.22], hint: "Pasá por detrás del primer seno…" },
      { at: [0.16, -0.06, 0.3], hint: "…y sacalo por delante: el chicote quedó dentro del seno." },
    ],
    ajuste: "Tirá del chicote hacia abajo para peinar y apretar el ocho.",
    pull: [0.4, -2.4, 0.4],
    target: [0, 0.2, 0],
  },
};

// Marca en el contenido del módulo: <!-- minijuego:ocho -->
const MARKER = /<!--\s*minijuego:(ocho|dinamico|ballestrinque)\s*-->/;

export function parseKnotMarker(content: string): { knot: KnotId | null; content: string } {
  const m = content.match(MARKER);
  return { knot: (m?.[1] as KnotId) ?? null, content: content.replace(MARKER, "").trimEnd() };
}
