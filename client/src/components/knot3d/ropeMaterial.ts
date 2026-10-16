import * as THREE from "three";

// ============================================================
// Material de cuerda dinámica realista (camisa trenzada / kernmantle).
// Se genera por código: un mapa de alturas con los "husos" de la trenza
// entrecruzados a ±45°, del que salen el color, el relieve (normal map) y la
// rugosidad. Un tile = un paso de trenza alrededor de toda la circunferencia.
// ============================================================

const W = 1024; // a lo largo de la cuerda
const H = 256; // alrededor de la circunferencia
const CARRIERS = 16; // husos por sentido (cuerda de escalada típica)

// Paleta típica de cuerda dinámica: base naranja con un hilo azul y uno blanco en hélice
const PALETTE = ["#e8601c", "#e8601c", "#d9531a", "#e8601c", "#1f3b8f", "#e8601c", "#d9531a", "#e8601c", "#e8601c", "#f2efe6", "#e8601c", "#d9531a", "#e8601c", "#e8601c", "#1f3b8f", "#d9531a"];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function createRopeMaterial(): THREE.MeshPhysicalMaterial {
  const height = new Float32Array(W * H);
  const color = new Uint8ClampedArray(new ArrayBuffer(W * H * 4));
  const pitch = W / CARRIERS; // largo de cada "grano" de la trenza
  const rnd = (i: number) => {
    const x = Math.sin(i * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // Coordenadas en los dos sentidos de la trenza (diagonales que dan la vuelta)
      const a = (x / pitch + (y / H) * CARRIERS) % CARRIERS;
      const b = (x / pitch - (y / H) * CARRIERS + CARRIERS * 4) % CARRIERS;
      const ia = Math.floor(a);
      const ib = Math.floor(b);
      const fa = a - ia;
      const fb = b - ib;
      // Trenza 2 sobre 2: según la celda, arriba pasa el huso de un sentido o del otro
      const aOnTop = ((ia >> 1) + (ib >> 1)) % 2 === 0;
      const across = aOnTop ? fa : fb; // posición transversal dentro del huso
      const along = aOnTop ? fb : fa; // posición a lo largo del huso
      // Perfil redondeado del huso y leve hundimiento donde pasa por debajo
      const profile = Math.sin(Math.PI * across);
      const dip = 0.75 + 0.25 * Math.sin(Math.PI * along);
      // Fibras finas a lo largo del huso
      const fiber = 0.06 * Math.sin((across * 9 + rnd(ia * 31 + ib) * 6) * Math.PI) + 0.04 * (rnd(x * 7 + y * 13) - 0.5);
      const h = Math.max(0, profile * dip + fiber);
      height[y * W + x] = h;

      const carrier = aOnTop ? ia : ib;
      const [r, g, bl] = hexToRgb(PALETTE[carrier % PALETTE.length]);
      // Sombreado de oclusión entre husos para dar profundidad al color
      const shade = 0.45 + 0.55 * Math.pow(h, 0.6);
      const i = (y * W + x) * 4;
      color[i] = r * shade;
      color[i + 1] = g * shade;
      color[i + 2] = bl * shade;
      color[i + 3] = 255;
    }
  }

  // Normal map a partir de las alturas (Sobel)
  const normal = new Uint8ClampedArray(new ArrayBuffer(W * H * 4));
  const rough = new Uint8ClampedArray(new ArrayBuffer(W * H * 4));
  const hAt = (x: number, y: number) => height[((y + H) % H) * W + ((x + W) % W)];
  const strength = 3.2;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (hAt(x + 1, y) - hAt(x - 1, y)) * strength;
      const dy = (hAt(x, y + 1) - hAt(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * W + x) * 4;
      normal[i] = ((-dx / len) * 0.5 + 0.5) * 255;
      normal[i + 1] = ((-dy / len) * 0.5 + 0.5) * 255;
      normal[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      normal[i + 3] = 255;
      // Las crestas de los husos están más pulidas por el roce; los valles, más ásperos
      const r = 255 * (0.95 - 0.3 * height[y * W + x]);
      rough[i] = rough[i + 1] = rough[i + 2] = r;
      rough[i + 3] = 255;
    }
  }

  const tex = (data: Uint8ClampedArray<ArrayBuffer>, srgb: boolean) => {
    const t = new THREE.DataTexture(data, W, H, THREE.RGBAFormat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  };

  return new THREE.MeshPhysicalMaterial({
    map: tex(color, true),
    normalMap: tex(normal, false),
    normalScale: new THREE.Vector2(1.4, 1.4),
    roughnessMap: tex(rough, false),
    roughness: 1,
    metalness: 0,
    // Pelusa textil: brillo suave en los bordes, como el nylon de una cuerda usada
    sheen: 1,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color("#ffb38a"),
  });
}

// Ajusta la cantidad de repeticiones según el largo para que la trenza no se estire
export function setRopeLength(mat: THREE.MeshPhysicalMaterial, length: number, diameter: number) {
  const repeat = length / (diameter * 4);
  [mat.map, mat.normalMap, mat.roughnessMap].forEach((t) => t?.repeat.set(repeat, 1));
}
