import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { KnotDef, Vec } from "./knots";
import { createRopeMaterial, setRopeLength } from "./ropeMaterial";

// ============================================================
// Motor 3D del minijuego de nudos.
// La soga es una polilínea que se va apoyando donde arrastrás el chicote;
// choca contra el lomo del mosquetón (o contra el firme) y contra sí misma.
// Al pasar por todos los pasos empieza el ajuste: tirar del chicote relaja la
// soga y las vueltas se cierran sobre el mosquetón.
// ============================================================

const ROPE_R = 0.055;
const SPACING = 0.06; // distancia entre puntos de la soga
const BEND = 0.22; // rigidez a la flexión: evita codos más cerrados que la cuerda real
const STEP_REACH = 0.14; // radio para considerar alcanzado un paso
const MOVE_STEP = 0.02; // avance máximo del chicote por subpaso (evita atravesar obstáculos)
const BAR_R = 0.075;
const FLOOR_Y = -2.5;
const ease = (t: number) => t * t * (3 - 2 * t);
const GATE_OPEN_ANGLE = -0.3; // el gatillo (bisagra arriba) se abre hacia adentro, como en un mosquetón real
const WALL_Z = -1.7;

export type Phase = "lay" | "tighten" | "done";
export type EngineEvents = {
  onStep: (done: number) => void;
  onGate: (open: boolean) => void;
  onNotice?: (text: string | null) => void;
  onPhase: (phase: Phase) => void;
  onTension: (t: number) => void;
};
export type View = "frente" | "lateral" | "arriba";

const v3 = (p: Vec) => new THREE.Vector3(p[0], p[1], p[2]);

function samplePath(points: THREE.Vector3[], step: number): THREE.Vector3[] {
  const out = [points[0].clone()];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const n = Math.max(1, Math.round(a.distanceTo(b) / step));
    for (let k = 1; k <= n; k++) out.push(a.clone().lerp(b, k / n));
  }
  return out;
}

// Subdivisión de Chaikin: redondea las esquinas de la polilínea manteniendo los extremos
function chaikin(points: THREE.Vector3[], iterations: number): THREE.Vector3[] {
  let pts = points;
  for (let it = 0; it < iterations; it++) {
    const out = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      out.push(pts[i].clone().lerp(pts[i + 1], 0.25), pts[i].clone().lerp(pts[i + 1], 0.75));
    }
    out.push(pts[pts.length - 1]);
    pts = out;
  }
  return pts;
}

function noiseTexture(base: [number, number, number], spread: number, size = 256): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const img = g.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const n = (Math.random() - 0.5) * spread;
    const blob = Math.sin(i * 0.013) * Math.cos(i * 0.0007) * spread * 0.5;
    img.data[i * 4] = base[0] + n + blob;
    img.data[i * 4 + 1] = base[1] + n + blob;
    img.data[i * 4 + 2] = base[2] + n + blob;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function labelSprite(text: string): THREE.Sprite {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#1B5E20";
  g.beginPath();
  g.arc(32, 32, 28, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#fff";
  g.font = "bold 34px sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 32, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  s.scale.set(0.16, 0.16, 1);
  s.renderOrder = 10;
  return s;
}

// Curva del mosquetón (forma de pera/HMS) en el plano XY; el lomo es x = 0
function carabinerCurve(): THREE.CatmullRomCurve3 {
  const pts: [number, number][] = [
    [0, -1.1],
    [0, -0.4],
    [0, 0.4],
    [0, 1.05],
    [0.15, 1.42],
    [0.55, 1.5],
    [0.9, 1.15],
    [0.95, 0.5],
    [0.82, -0.4],
    [0.55, -1.2],
    [0.25, -1.42],
    [0.04, -1.35],
  ];
  // Lado ancho (nariz del gatillo y seguro) abajo, donde se arma el dinámico; el angosto cuelga de la cinta
  return new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, -y, 0)), true, "catmullrom", 0.5);
}

function insidePolygon(x: number, y: number, poly: [number, number][]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export class KnotEngine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private ropeMat: THREE.MeshPhysicalMaterial;
  private ropeMesh: THREE.Mesh;
  private tipMesh: THREE.Mesh;
  private tipHalo: THREE.Mesh;
  private tipProxy: THREE.Mesh;
  private stepGroup = new THREE.Group();
  private guide: THREE.Line;
  private carabinerMesh: THREE.Mesh | null = null;
  private gateGroup: THREE.Group | null = null;
  private gateMat: THREE.MeshStandardMaterial | null = null;
  private gateOpen = false;
  private gateHint = false;
  private bodySamples: THREE.Vector3[] = [];
  private gateSamples: THREE.Vector3[] = [];
  private polygon: [number, number][] = [];
  // Modo guiado (dinámico según la figura del manual)
  private ctrl: THREE.Vector3[] = [];
  private stageT = 0;
  private morph: { from: Vec[]; to: Vec[]; t: number } | null = null;
  private handles: THREE.Mesh[] = [];
  private stagedDrag: { kind: "push" | "end"; side: 0 | 1; startX: number; startY: number; base: number } | null = null;
  private sideProgress: [number, number] = [0, 0];
  private flipT = 0;
  private flow = 0;
  private autoClosed = false;
  private locked = false;
  private sleeve: THREE.Mesh | null = null;
  private sleeveBase = new THREE.Vector3();
  private stepProxy: THREE.Mesh | null = null;
  private obstacles: THREE.Vector3[] = []; // puntos del lomo / firme con su radio
  private obstacleR = BAR_R;
  private pts: THREE.Vector3[] = [];
  private fixed = 0;
  private done = 0;
  private phase: Phase = "lay";
  private tension = 0;
  private dragging = false;
  private dragPlane = new THREE.Plane();
  private dragTarget: THREE.Vector3 | null = null;
  private pullStart = new THREE.Vector3();
  private pullAmount = 0;
  private dirty = true;
  private showGuide = true;
  private raf = 0;
  private resizeObs: ResizeObserver;
  private disposables: { dispose(): void }[] = [];

  constructor(private host: HTMLElement, private def: KnotDef, private ev: EngineEvents) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.touchAction = "none";

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.05, 60);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 2.2;
    this.controls.maxDistance = 9;
    this.controls.enablePan = false;
    this.controls.maxPolarAngle = Math.PI * 0.62;

    this.buildEnvironment();
    if (def.carabiner) this.buildCarabiner();

    this.ropeMat = createRopeMaterial();
    this.ropeMesh = new THREE.Mesh(new THREE.BufferGeometry(), this.ropeMat);
    this.ropeMesh.castShadow = true;
    this.ropeMesh.receiveShadow = true;
    this.scene.add(this.ropeMesh);

    // Chicote: punta con cinta termosellada
    this.tipMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(ROPE_R * 1.06, ROPE_R * 1.02, 0.16, 24),
      new THREE.MeshPhysicalMaterial({ color: "#151515", roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.35 })
    );
    this.tipMesh.castShadow = true;
    this.scene.add(this.tipMesh);
    // Aro que indica de dónde agarrar
    this.tipHalo = new THREE.Mesh(
      new THREE.TorusGeometry(ROPE_R * 2.4, 0.012, 10, 40),
      new THREE.MeshBasicMaterial({ color: "#8BC34A", transparent: true, opacity: 0.9, depthTest: false })
    );
    this.tipHalo.renderOrder = 6;
    this.scene.add(this.tipHalo);
    this.tipProxy = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), new THREE.MeshBasicMaterial({ visible: false }));
    this.scene.add(this.tipProxy);

    this.scene.add(this.stepGroup);
    this.guide = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineDashedMaterial({ color: "#2E7D32", dashSize: 0.06, gapSize: 0.05, transparent: true, opacity: 0.8, depthTest: false })
    );
    this.guide.renderOrder = 5;
    this.scene.add(this.guide);

    this.reset();
    this.setView("frente");

    const el = this.renderer.domElement;
    el.addEventListener("pointerdown", this.onDown);
    el.addEventListener("pointermove", this.onMove);
    el.addEventListener("pointerup", this.onUp);
    el.addEventListener("pointercancel", this.onUp);
    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(host);
    this.resize();
    this.loop();
    if (import.meta.env.DEV) (window as unknown as { __knot?: KnotEngine }).__knot = this;
  }

  // Solo para pruebas: posición en pantalla (px del lienzo) de un punto de la escena
  debugScreen(p: THREE.Vector3 | Vec) {
    const v = (Array.isArray(p) ? v3(p) : p.clone()).project(this.camera);
    const r = this.renderer.domElement.getBoundingClientRect();
    return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
  }

  debugTip() {
    return this.debugScreen(this.tip());
  }

  // ---------------- escena ----------------

  private buildEnvironment() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = env;
    this.disposables.push(pmrem, env);
    this.scene.background = new THREE.Color("#dfe9dc");
    this.scene.fog = new THREE.Fog("#dfe9dc", 9, 20);

    this.scene.add(new THREE.HemisphereLight("#ffffff", "#7c8f6a", 0.55));
    const sun = new THREE.DirectionalLight("#fff6e5", 2.2);
    sun.position.set(3, 6, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -4;
    sun.shadow.camera.right = 4;
    sun.shadow.camera.top = 4;
    sun.shadow.camera.bottom = -4;
    sun.shadow.bias = -0.0005;
    this.scene.add(sun);

    const groundTex = noiseTexture([120, 128, 104], 40);
    groundTex.repeat.set(6, 6);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = FLOOR_Y;
    ground.receiveShadow = true;
    this.scene.add(ground);

    if (this.def.carabiner) {
      const rockTex = noiseTexture([142, 132, 120], 60);
      rockTex.repeat.set(3, 3);
      const wall = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 10, 60, 40),
        new THREE.MeshStandardMaterial({ map: rockTex, roughness: 0.92 })
      );
      // Relieve irregular de roca
      const pos = wall.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        pos.setZ(i, Math.sin(x * 1.7) * 0.08 + Math.cos(y * 2.3 + x) * 0.06 + (Math.random() - 0.5) * 0.04);
      }
      wall.geometry.computeVertexNormals();
      wall.position.set(0, 2, WALL_Z);
      wall.receiveShadow = true;
      this.scene.add(wall);
    }
  }

  private buildCarabiner() {
    const curve = carabinerCurve();
    const metal = new THREE.MeshStandardMaterial({ color: "#c9ced6", metalness: 0.95, roughness: 0.22 });

    // El cuerpo y el gatillo son piezas separadas: el gatillo es el tramo derecho
    // entre la bisagra (abajo) y la nariz (arriba)
    const ring = curve.getSpacedPoints(400).slice(0, -1);
    const isGate = (p: THREE.Vector3) => p.x > 0.78 && p.y < 0.42 && p.y > -0.98;
    const startIdx = ring.findIndex((p, i) => isGate(ring[(i - 1 + ring.length) % ring.length]) && !isGate(p));
    const ordered = [...ring.slice(startIdx), ...ring.slice(0, startIdx)];
    const bodyPts = ordered.filter((p) => !isGate(p));
    const gatePts = ordered.filter(isGate);
    // El gatillo recorre de la nariz (abajo) a la bisagra (arriba)
    const hinge = gatePts.reduce((a, b) => (b.y > a.y ? b : a)).clone();

    const body = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bodyPts), 240, BAR_R, 16, false), metal);
    body.castShadow = true;
    body.receiveShadow = true;
    this.scene.add(body);
    this.carabinerMesh = body;
    // Tapas en los extremos del cuerpo (nariz y bisagra)
    [bodyPts[0], bodyPts[bodyPts.length - 1]].forEach((p) => {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(BAR_R * 1.05, 16, 16), metal);
      cap.position.copy(p);
      this.scene.add(cap);
    });

    const gate = new THREE.Group();
    gate.position.copy(hinge);
    this.gateMat = new THREE.MeshStandardMaterial({ color: "#c9ced6", metalness: 0.95, roughness: 0.22, emissive: "#7CB342", emissiveIntensity: 0 });
    const gateMesh = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(gatePts.map((p) => p.clone().sub(hinge))), 60, BAR_R * 0.82, 14, false),
      this.gateMat
    );
    gateMesh.castShadow = true;
    gateMesh.userData.gate = true;
    gate.add(gateMesh);
    // Seguro de rosca: viaja con el gatillo
    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(BAR_R * 1.55, BAR_R * 1.55, 0.42, 20),
      new THREE.MeshStandardMaterial({ color: "#d4a017", metalness: 0.85, roughness: 0.3 })
    );
    sleeve.position.set(0.95 - hinge.x, -0.62 - hinge.y, 0);
    sleeve.rotation.z = -0.06;
    sleeve.castShadow = true;
    sleeve.userData.gate = true;
    gate.add(sleeve);
    this.sleeve = sleeve;
    this.sleeveBase.copy(sleeve.position);
    // Zona más grande para tocar el gatillo con facilidad
    const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.4, 8), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(0.95 - hinge.x - 0.05, -0.25 - hinge.y, 0);
    hit.userData.gate = true;
    gate.add(hit);
    this.scene.add(gate);
    this.gateGroup = gate;

    // Cinta que lo cuelga de la chapa en la roca
    const sling = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([v3([0.14, 1.46, 0]), v3([0.2, 2.0, -0.5]), v3([0.2, 2.5, WALL_Z + 0.08])]),
        40,
        0.05,
        8
      ),
      new THREE.MeshStandardMaterial({ color: "#1d4ed8", roughness: 0.7 })
    );
    sling.castShadow = true;
    this.scene.add(sling);
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.08, 20),
      new THREE.MeshStandardMaterial({ color: "#9ca3af", metalness: 0.9, roughness: 0.3 })
    );
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(0.2, 2.55, WALL_Z + 0.04);
    this.scene.add(bolt);

    this.bodySamples = bodyPts;
    this.gateSamples = gatePts;
    this.polygon = ring.filter((_, i) => i % 3 === 0).map((p) => [p.x, p.y] as [number, number]);
    this.obstacleR = BAR_R;
    this.updateObstacles();
  }

  private updateObstacles() {
    if (!this.def.carabiner || !this.gateGroup) return;
    // El gatillo gira sobre su bisagra: sus puntos de colisión acompañan el giro
    const hinge = this.gateGroup.position;
    const a = this.gateGroup.rotation.z;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const gate = this.gateSamples.map((p) => {
      const x = p.x - hinge.x;
      const y = p.y - hinge.y;
      return new THREE.Vector3(hinge.x + x * c - y * sn, hinge.y + x * sn + y * c, p.z);
    });
    this.obstacles = [...this.bodySamples, ...gate];
  }

  // Abre o cierra el gatillo (al tocarlo o desde el botón)
  toggleGate() {
    if (!this.def.carabiner || this.phase === "done") return;
    const current = this.def.steps[this.done];
    if (current?.gate === "lock" && !this.gateOpen) {
      this.locked = true;
      this.completeStagedStep();
      return;
    }
    if (this.locked) {
      this.ev.onNotice?.("El seguro está enroscado.");
      return;
    }
    this.gateOpen = !this.gateOpen;
    this.updateObstacles();
    this.ev.onGate(this.gateOpen);
    const step = this.def.steps[this.done];
    if (this.def.staged && step?.gate && step.gate === (this.gateOpen ? "open" : "close")) {
      this.completeStagedStep();
      return;
    }
    if (step?.gate && step.gate === (this.gateOpen ? "open" : "close")) {
      this.done += 1;
      this.ev.onStep(this.done);
      if (this.done === this.def.steps.length) {
        this.phase = "tighten";
        this.ev.onPhase("tighten");
      }
    }
    this.buildSteps();
  }

  // Con el gatillo cerrado la cuerda no puede atravesar el plano del mosquetón:
  // para meterla hay que abrirlo, como en la pared
  private membrane(prev: THREE.Vector3, next: THREE.Vector3) {
    if (!this.def.carabiner || this.gateOpen) return;
    if (!insidePolygon(next.x, next.y, this.polygon)) return;
    const side = Math.sign(prev.z) || 1;
    const min = ROPE_R + 0.03;
    if (next.z * side < min) next.z = side * min;
  }

  // ---------------- modo guiado ----------------

  private frames(a: Vec[], b: Vec[], t: number) {
    const k = ease(Math.min(1, Math.max(0, t)));
    return a.map((p, i) => v3(p).lerp(v3(b[i]), k));
  }

  private setCtrl(points: THREE.Vector3[]) {
    this.ctrl = points;
    this.pts = new THREE.CatmullRomCurve3(points, false, "centripetal").getSpacedPoints(160);
    this.fixed = 0;
    this.resolveCollisions(8);
    this.dirty = true;
  }

  // Toda la soga es sólida: ningún tramo atraviesa a otro ni al metal.
  // Los extremos quedan fijos; el resto se separa lo justo, manteniendo la forma.
  private resolveCollisions(iters: number) {
    const n = this.pts.length;
    const seg = this.pts[0].distanceTo(this.pts[1]) || SPACING;
    const gap = Math.ceil((ROPE_R * 2.1) / seg) + 1;
    for (let it = 0; it < iters; it++) {
      this.buildGrid();
      for (let i = 1; i < n - 1; i++) {
        this.selfCollide(i, gap);
        this.pushOut(this.pts[i]);
      }
      // Largo constante entre puntos: la soga no se estira al separarse
      for (let i = 1; i < n - 1; i++) {
        const a = this.pts[i - 1];
        const p = this.pts[i];
        const d = p.distanceTo(a);
        if (d > seg * 1.15) p.lerp(a, 1 - (seg * 1.15) / d);
      }
      // Suavizado leve para que los empujones no dejen quiebres
      for (let i = 1; i < n - 1; i++) {
        const mid = this.pts[i - 1].clone().add(this.pts[i + 1]).multiplyScalar(0.5);
        this.pts[i].lerp(mid, 0.12);
        this.pushOut(this.pts[i]);
      }
    }
    this.dirty = true;
  }

  private completeStagedStep() {
    this.done += 1;
    this.ev.onStep(this.done);
    this.stagedDrag = null;
    this.controls.enabled = true;
    this.ev.onNotice?.(null);
    const finished = this.def.steps[this.done - 1];
    const kf = this.def.staged!.keyframes;
    if (finished?.push?.then !== undefined) {
      // La cuerda forma sola la siguiente gaza, como en la figura
      const path = finished.push.path;
      this.morph = { from: kf[path[path.length - 1]], to: kf[finished.push.then], t: 0 };
    }
    this.autoClosed = false;
    if (this.done === this.def.steps.length) {
      this.phase = "tighten";
      this.ev.onPhase("tighten");
    }
    this.stageT = 0;
    this.buildSteps();
  }

  private stagedLoop(dt: number) {
    const st = this.def.staged!;
    if (this.morph) {
      this.morph.t += dt / 0.9;
      this.setCtrl(this.frames(this.morph.from, this.morph.to, this.morph.t));
      if (this.morph.t >= 1) {
        this.morph = null;
        this.buildSteps();
      }
    }
    if (this.phase === "tighten" && this.stagedDrag?.kind === "end" && this.pullAmount > 0.05) {
      const side = this.stagedDrag.side;
      // La cuerda corre hacia el extremo del que tirás y el nudo se da vuelta
      this.flow += (side === 0 ? -1 : 1) * this.pullAmount * dt * 1.6;
      const target = side === 0 ? 0 : 1;
      this.flipT += Math.sign(target - this.flipT) * Math.min(Math.abs(target - this.flipT), dt * 2.2);
      this.setCtrl(this.frames(st.keyframes[st.keyframes.length - 1], st.flip, this.flipT));
      const before = this.sideProgress[side];
      this.sideProgress[side] = Math.min(1, before + (this.pullAmount * dt) / 1.4);
      // Lado probado: su manija desaparece
      if (before < 1 && this.sideProgress[side] >= 1) this.buildSteps();
      this.tension = (this.sideProgress[0] + this.sideProgress[1]) / 2;
      this.ev.onTension(this.tension);
      if (this.sideProgress[0] >= 1 && this.sideProgress[1] >= 1) {
        this.phase = "done";
        this.stagedDrag = null;
        this.controls.enabled = true;
        this.ev.onPhase("done");
        this.buildSteps();
      }
    }
    this.handles.forEach((h) => h.position.copy(this.nearestRopePoint(this.ctrl[h.userData.idx as number])));
  }

  private nearestRopePoint(p: THREE.Vector3) {
    let best = this.pts[0];
    let bd = Infinity;
    for (const q of this.pts) {
      const d = q.distanceToSquared(p);
      if (d < bd) {
        bd = d;
        best = q;
      }
    }
    return best;
  }

  private buildHandles() {
    this.handles = [];
    if (this.morph) return;
    const add = (idx: number, side: 0 | 1, kind: "push" | "end", dir?: THREE.Vector3) => {
      const h = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 20, 20),
        new THREE.MeshStandardMaterial({ color: "#8BC34A", emissive: "#7CB342", emissiveIntensity: 0.9, transparent: true, opacity: 0.8, depthTest: false })
      );
      h.renderOrder = 7;
      h.userData = { idx, side, kind, current: true };
      h.position.copy(this.nearestRopePoint(this.ctrl[idx]));
      this.stepGroup.add(h);
      this.handles.push(h);
      if (dir) this.stepGroup.add(new THREE.ArrowHelper(dir, this.ctrl[idx].clone().add(dir.clone().multiplyScalar(0.12)), 0.55, "#7CB342", 0.14, 0.08));
    };
    const step = this.def.steps[this.done];
    if (this.phase === "lay" && step?.push) {
      add(step.push.handle, 0, "push", new THREE.Vector3(step.push.dir === "derecha" ? 1 : -1, 0, 0));
    } else if (this.phase === "tighten") {
      const last = this.ctrl.length - 1;
      if (this.sideProgress[0] < 1) add(0, 0, "end", new THREE.Vector3(0, -1, 0));
      if (this.sideProgress[1] < 1) add(last, 1, "end", new THREE.Vector3(0, -1, 0));
    }
  }

  // ---------------- estado ----------------

  reset() {
    const firme = this.def.firme.map(v3);
    if (this.def.staged) {
      this.morph = null;
      this.stageT = 0;
      this.stagedDrag = null;
      this.sideProgress = [0, 0];
      this.flipT = 0;
      this.flow = 0;
      this.setCtrl(this.def.staged.keyframes[0].map(v3));
    } else {
      this.pts = samplePath(firme, SPACING);
      this.fixed = this.pts.length - 1;
    }
    if (!this.def.carabiner) {
      // En el ocho el obstáculo es el propio firme
      this.obstacles = samplePath(firme.slice(0, -1), 0.03);
      this.obstacleR = ROPE_R;
    }
    this.done = 0;
    this.phase = "lay";
    this.tension = 0;
    this.gateOpen = false;
    this.locked = false;
    this.autoClosed = false;
    this.updateObstacles();
    this.ev.onGate(false);
    this.dragging = false;
    this.dragTarget = null;
    this.controls.enabled = true;
    this.buildSteps();
    this.dirty = true;
    this.ev.onStep(0);
    this.ev.onPhase("lay");
    this.ev.onTension(0);
  }

  setGuide(on: boolean) {
    this.showGuide = on;
    this.guide.visible = on;
    this.buildSteps();
  }

  setView(view: View) {
    const t = v3(this.def.target);
    // El dinámico guiado se arma en la barra de abajo: cámara más cerca
    const d = this.def.staged ? 3.4 : 5.4;
    const pos =
      view === "frente"
        ? new THREE.Vector3(t.x + 0.6, t.y + 0.5, t.z + d)
        : view === "lateral"
          ? new THREE.Vector3(t.x + d, t.y + 0.4, t.z + 0.6)
          : new THREE.Vector3(t.x + 0.2, t.y + d * 0.85, t.z + 2.6);
    this.camera.position.copy(pos);
    this.controls.target.copy(t);
    // Sin amortiguación por un cuadro: descarta la inercia de giros anteriores
    this.controls.enableDamping = false;
    this.controls.update();
    this.controls.enableDamping = true;
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.resizeObs.disconnect();
    const el = this.renderer.domElement;
    el.removeEventListener("pointerdown", this.onDown);
    el.removeEventListener("pointermove", this.onMove);
    el.removeEventListener("pointerup", this.onUp);
    el.removeEventListener("pointercancel", this.onUp);
    this.controls.dispose();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => {
        (x as THREE.MeshStandardMaterial).map?.dispose();
        x.dispose();
      });
    });
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
    el.remove();
  }

  // ---------------- pasos y guía ----------------

  private buildSteps() {
    this.stepGroup.clear();
    this.stepProxy = null;
    this.gateHint = this.phase === "lay" && !!this.def.steps[this.done]?.gate;
    if (this.def.staged) {
      this.buildHandles();
      this.guide.visible = false;
      return;
    }
    this.def.steps.forEach((s, i) => {
      if (this.phase !== "lay" || i < this.done || !s.at) return;
      const current = i === this.done;
      if (!current && !this.showGuide) return;
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(current ? 0.11 : 0.06, 20, 20),
        new THREE.MeshStandardMaterial({
          color: current ? "#8BC34A" : "#2E7D32",
          emissive: current ? "#7CB342" : "#1B5E20",
          emissiveIntensity: current ? 0.9 : 0.3,
          transparent: true,
          opacity: current ? 0.75 : 0.35,
          depthWrite: false,
        })
      );
      const at = s.at;
      mesh.position.copy(v3(at));
      mesh.userData.current = current;
      this.stepGroup.add(mesh);
      if (current) {
        // Zona de "imán": si apuntás al paso y se ve, la soga va hasta su profundidad
        this.stepProxy = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), new THREE.MeshBasicMaterial({ visible: false }));
        this.stepProxy.position.copy(v3(at));
        this.stepGroup.add(this.stepProxy);
        const label = labelSprite(String(i + 1));
        label.position.copy(v3(at)).add(new THREE.Vector3(0, 0.2, 0));
        this.stepGroup.add(label);
      }
    });
    if (this.phase === "tighten") {
      // Flecha fantasma hacia dónde tirar
      const arrow = new THREE.ArrowHelper(
        v3(this.def.pull).sub(this.tip()).normalize(),
        this.tip(),
        0.9,
        "#7CB342",
        0.18,
        0.1
      );
      this.stepGroup.add(arrow);
    }
    this.updateGuide();
  }

  private updateGuide() {
    const remaining =
      this.phase === "lay" ? this.def.steps.slice(this.done).flatMap((s) => (s.at ? [v3(s.at)] : [])) : [];
    const pts = remaining.length ? [this.tip(), ...remaining] : [];
    this.guide.geometry.dispose();
    this.guide.geometry = new THREE.BufferGeometry().setFromPoints(pts);
    this.guide.computeLineDistances();
    this.guide.visible = this.showGuide && pts.length > 0;
  }

  private tip() {
    return this.pts[this.pts.length - 1];
  }

  // ---------------- física simple ----------------

  // Empuja un punto fuera del mosquetón/firme, del piso y de la pared
  private pushOut(p: THREE.Vector3) {
    const min = this.obstacleR + ROPE_R;
    for (const o of this.obstacles) {
      const dx = p.x - o.x;
      const dy = p.y - o.y;
      const dz = p.z - o.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < min * min) {
        const d = Math.sqrt(d2) || 1e-4;
        const k = (min - d) / d;
        p.x += dx * k;
        p.y += dy * k;
        p.z += dz * k;
      }
    }
    p.y = Math.max(FLOOR_Y + ROPE_R, p.y);
    if (this.def.carabiner) p.z = Math.max(WALL_Z + 0.15, p.z);
  }

  // Grilla espacial para no comparar todos los puntos contra todos
  private grid = new Map<string, number[]>();
  private static CELL = ROPE_R * 2.1;
  private key(v: THREE.Vector3) {
    const c = KnotEngine.CELL;
    return `${Math.floor(v.x / c)},${Math.floor(v.y / c)},${Math.floor(v.z / c)}`;
  }
  private buildGrid() {
    this.grid.clear();
    this.pts.forEach((p, i) => {
      const k = this.key(p);
      const cell = this.grid.get(k);
      if (cell) cell.push(i);
      else this.grid.set(k, [i]);
    });
  }
  private neighbors(p: THREE.Vector3): number[] {
    const c = KnotEngine.CELL;
    const cx = Math.floor(p.x / c);
    const cy = Math.floor(p.y / c);
    const cz = Math.floor(p.z / c);
    const out: number[] = [];
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (let dz = -1; dz <= 1; dz++) {
          const cell = this.grid.get(`${cx + dx},${cy + dy},${cz + dz}`);
          if (cell) out.push(...cell);
        }
    return out;
  }

  // La soga no se atraviesa a sí misma: cada punto es una esfera del grosor de la cuerda
  // (usa la grilla construida con buildGrid)
  private selfCollide(i: number, gap = 5) {
    const p = this.pts[i];
    const min = ROPE_R * 2.1;
    for (const j of this.neighbors(p)) {
      if (Math.abs(i - j) < gap || j >= this.pts.length) continue;
      const q = this.pts[j];
      const d = p.distanceTo(q);
      if (d < min && d > 1e-5) {
        const qFixed = j <= this.fixed;
        const push = p.clone().sub(q).multiplyScalar((min - d) / d / (qFixed ? 1 : 2));
        if (i > this.fixed) p.add(push);
        if (!qFixed) q.sub(push);
      }
    }
  }

  // Rigidez y contacto: suaviza los codos y resuelve choques en el tramo [from, último)
  private relax(from: number, bend: number, iters: number) {
    const start = Math.max(this.fixed + 1, from);
    const last = this.pts.length - 1;
    for (let it = 0; it < iters; it++) {
      for (let i = start; i < last; i++) {
        const p = this.pts[i];
        const mid = this.pts[i - 1].clone().add(this.pts[i + 1]).multiplyScalar(0.5);
        p.lerp(mid, bend);
        this.pushOut(p);
      }
      this.buildGrid();
      for (let i = start; i <= last; i++) this.selfCollide(i);
      for (let i = start; i < last; i++) this.pushOut(this.pts[i]);
    }
    this.evenSpacing();
  }

  // Mantiene la separación pareja entre puntos: sin amontonamientos ni tramos largos
  private evenSpacing() {
    for (let i = this.pts.length - 2; i > this.fixed; i--) {
      if (this.pts[i].distanceTo(this.pts[i - 1]) < SPACING * 0.55) this.pts.splice(i, 1);
    }
    for (let i = this.fixed + 1; i < this.pts.length; i++) {
      const a = this.pts[i - 1];
      const b = this.pts[i];
      if (a.distanceTo(b) > SPACING * 1.6) this.pts.splice(i, 0, a.clone().lerp(b, 0.5));
    }
  }

  private moveTip(target: THREE.Vector3) {
    const tip = this.tip();
    this.buildGrid();
    let guard = 0;
    while (tip.distanceTo(target) > MOVE_STEP * 0.5 && guard++ < 200) {
      const dir = target.clone().sub(tip);
      const len = dir.length();
      const next = tip.clone().add(dir.multiplyScalar(Math.min(MOVE_STEP, len) / len));
      this.pushOut(next);
      this.membrane(tip, next);
      if (next.distanceTo(tip) < 1e-4) break; // trabado contra el mosquetón
      // Al avanzar se va apoyando soga detrás del chicote
      const prev = this.pts[this.pts.length - 2];
      if (prev.distanceTo(next) > SPACING) this.pts.splice(this.pts.length - 1, 0, tip.clone());
      tip.copy(next);
      this.selfCollide(this.pts.length - 1);

      const step = this.def.steps[this.done];
      if (step?.at && tip.distanceTo(v3(step.at)) < STEP_REACH) {
        this.done += 1;
        this.ev.onStep(this.done);
        if (this.done === this.def.steps.length) {
          this.phase = "tighten";
          this.ev.onPhase("tighten");
        }
        this.buildSteps();
        if (this.phase !== "lay") break;
      }
    }
    // Solo se filtra el temblor del tramo recién apoyado: lo anterior queda en su lugar por fricción
    this.relax(this.pts.length - 5, BEND * 0.4, 1);
    this.dirty = true;
    this.updateGuide();
  }

  // Ajuste: las vueltas se cierran hacia el eje del lomo (o del firme) sin cambiar
  // su altura ni su orden, así el nudo se aprieta en lugar de deshacerse
  private tighten(amount: number, dt: number) {
    const spots = this.def.steps.flatMap((st) => (st.at ? [v3(st.at)] : []));
    const center = spots.reduce((acc, p) => acc.add(p), new THREE.Vector3()).divideScalar(spots.length);
    const last = this.pts.length - 1;
    const k = 0.035 * amount;
    // Hasta dónde puede cerrarse: contra el lomo en el mosquetón; en el ocho las hebras
    // quedan apiladas alrededor del firme
    const minR = this.def.carabiner ? BAR_R + ROPE_R * 1.2 : ROPE_R * 3.4;
    for (let i = this.fixed + 1; i < last - 1; i++) {
      const p = this.pts[i];
      const r = Math.hypot(p.x, p.z);
      if (p.distanceTo(center) < 0.9 && r > minR) {
        const f = Math.max(minR / r, 1 - k);
        p.x *= f;
        p.z *= f;
      }
    }
    // El chicote sale en la dirección del tirón
    if (this.dragTarget) {
      const tip = this.tip();
      const prev = this.pts[this.pts.length - 2];
      const dir = this.dragTarget.clone().sub(prev);
      if (dir.length() > 1e-3) tip.lerp(prev.clone().add(dir.normalize().multiplyScalar(SPACING)), 0.5);
      this.pushOut(tip);
    }
    this.relax(this.fixed + 1, 0, 1);
    this.tension = Math.min(1, this.tension + (amount * dt) / 2.5);
    this.ev.onTension(this.tension);
    if (this.tension >= 1) {
      this.phase = "done";
      this.dragging = false;
      this.controls.enabled = true;
      this.ev.onPhase("done");
      this.buildSteps();
    }
    this.dirty = true;
  }

  // ---------------- puntero ----------------

  private pointer(e: PointerEvent) {
    const r = this.renderer.domElement.getBoundingClientRect();
    return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  }

  private planeHit(e: PointerEvent): THREE.Vector3 | null {
    this.raycaster.setFromCamera(this.pointer(e), this.camera);
    const hit = new THREE.Vector3();
    return this.raycaster.ray.intersectPlane(this.dragPlane, hit) ? hit : null;
  }

  private onDown = (e: PointerEvent) => {
    if (this.phase === "done") return;
    this.raycaster.setFromCamera(this.pointer(e), this.camera);
    if (this.def.staged) {
      const h = this.raycaster.intersectObjects(this.handles, false)[0]?.object;
      if (h) {
        this.stagedDrag = { kind: h.userData.kind, side: h.userData.side, startX: e.clientX, startY: e.clientY, base: this.stageT };
        this.controls.enabled = false;
        this.renderer.domElement.setPointerCapture(e.pointerId);
        e.stopPropagation();
        return;
      }
      const hits = this.gateGroup ? this.raycaster.intersectObject(this.gateGroup, true) : [];
      if (hits.some((x) => x.object.userData.gate)) {
        this.toggleGate();
        e.stopPropagation();
      }
      return;
    }
    if (!this.raycaster.intersectObject(this.tipProxy).length) {
      const hits = this.gateGroup ? this.raycaster.intersectObject(this.gateGroup, true) : [];
      if (hits.some((h) => h.object.userData.gate)) {
        this.toggleGate();
        e.stopPropagation();
      }
      return;
    }
    // Se arrastra sobre el plano que mira a la cámara y pasa por el chicote:
    // girando la vista cambiás en qué profundidad se mueve la soga
    const normal = new THREE.Vector3();
    this.camera.getWorldDirection(normal);
    this.dragPlane.setFromNormalAndCoplanarPoint(normal, this.tip());
    this.dragging = true;
    this.controls.enabled = false;
    this.renderer.domElement.setPointerCapture(e.pointerId);
    this.pullStart.copy(this.tip());
    this.pullAmount = 0;
    e.preventDefault();
    e.stopPropagation();
  };

  private onMove = (e: PointerEvent) => {
    if (this.def.staged && this.stagedDrag) {
      const d = this.stagedDrag;
      if (d.kind === "end") {
        this.pullAmount = Math.min(1, Math.max(0, (e.clientY - d.startY) / 140));
        return;
      }
      const step = this.def.steps[this.done];
      if (!step?.push || this.morph) return;
      const push = step.push;
      const sign = push.dir === "derecha" ? 1 : -1;
      let t = Math.min(1, Math.max(0, d.base + (sign * (e.clientX - d.startX)) / 320));
      // Una vez que la cuerda pasó y el gatillo se cerró, no puede volver a salir
      if (this.autoClosed && push.autoCloseAt !== undefined) t = Math.max(t, push.autoCloseAt);
      if (!this.gateOpen && !this.autoClosed && push.gateAt !== undefined && t > push.gateAt) {
        // La gaza choca contra el gatillo cerrado
        t = push.gateAt;
        this.ev.onNotice?.("El gatillo está cerrado: abrilo para meter la cuerda.");
      } else this.ev.onNotice?.(null);
      if (push.autoCloseAt !== undefined && t >= push.autoCloseAt && this.gateOpen && !this.autoClosed) {
        // Resorte: al pasar la cuerda, el gatillo se cierra solo
        this.gateOpen = false;
        this.autoClosed = true;
        this.updateObstacles();
        this.ev.onGate(false);
      }
      this.stageT = t;
      const kf = this.def.staged.keyframes;
      const segs = push.path.length - 1;
      const seg = Math.min(segs - 1, Math.floor(t * segs));
      const local = t * segs - seg;
      const a = kf[push.path[seg]];
      const b = kf[push.path[seg + 1]];
      this.setCtrl(a.map((p, i) => v3(p).lerp(v3(b[i]), local)));
      if (t >= 1) this.completeStagedStep();
      return;
    }
    if (!this.dragging) return;
    const hit = this.planeHit(e);
    if (!hit) return;
    this.dragTarget = hit;
    if (this.phase === "lay") {
      const magnet = this.magnetTarget();
      this.moveTip(magnet ?? hit);
      // El plano de arrastre acompaña la nueva profundidad del chicote
      const normal = new THREE.Vector3();
      this.camera.getWorldDirection(normal);
      this.dragPlane.setFromNormalAndCoplanarPoint(normal, this.tip());
    }
    else if (this.phase === "tighten") this.pullAmount = Math.min(1, hit.distanceTo(this.pullStart) / 0.8);
  };

  // El paso actual atrae al chicote solo si el rayo lo toca antes que al mosquetón
  private magnetTarget(): THREE.Vector3 | null {
    if (!this.stepProxy) return null;
    const objs: THREE.Object3D[] = [this.stepProxy];
    if (this.carabinerMesh) objs.push(this.carabinerMesh);
    const hits = this.raycaster.intersectObjects(objs, false);
    return hits[0]?.object === this.stepProxy ? this.stepProxy.position.clone() : null;
  }

  private onUp = () => {
    if (this.stagedDrag) {
      this.stagedDrag = null;
      this.ev.onNotice?.(null);
    }
    this.dragging = false;
    this.dragTarget = null;
    this.pullAmount = 0;
    this.controls.enabled = true;
  };

  // ---------------- render ----------------

  private resize() {
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = `${w}px`;
    this.renderer.domElement.style.height = `${h}px`;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private rebuildRope() {
    const curve = new THREE.CatmullRomCurve3(chaikin(this.pts, 3), false, "centripetal");
    const length = curve.getLength();
    const geo = new THREE.TubeGeometry(curve, Math.max(24, Math.round(length / 0.012)), ROPE_R, 24, false);
    this.ropeMesh.geometry.dispose();
    this.ropeMesh.geometry = geo;
    setRopeLength(this.ropeMat, length, ROPE_R * 2);
    [this.ropeMat.map, this.ropeMat.normalMap, this.ropeMat.roughnessMap].forEach((t) => t && (t.offset.x = this.flow * 6));

    const tip = this.tip();
    const prev = this.pts[this.pts.length - 2];
    const dir = tip.clone().sub(prev).normalize();
    this.tipMesh.position.copy(tip).addScaledVector(dir, -0.06);
    this.tipMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    this.tipHalo.position.copy(tip);
    this.tipProxy.position.copy(tip);
  }

  private lastFrame = performance.now();

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    if (this.def.staged) this.stagedLoop(dt);
    else if (this.phase === "tighten" && this.dragging && this.pullAmount > 0.05) this.tighten(this.pullAmount, dt);
    if (this.dirty) {
      this.rebuildRope();
      this.dirty = false;
    }
    const t = performance.now() / 1000;
    if (this.gateGroup) {
      const target = this.gateOpen ? GATE_OPEN_ANGLE : 0;
      const prevAngle = this.gateGroup.rotation.z;
      this.gateGroup.rotation.z += (target - prevAngle) * Math.min(1, dt * 10);
      if (Math.abs(this.gateGroup.rotation.z - prevAngle) > 1e-4) {
        this.updateObstacles();
        // El gatillo que se cierra empuja la cuerda en vez de atravesarla
        if (this.def.staged) this.resolveCollisions(3);
      }
      if (this.gateMat) this.gateMat.emissiveIntensity = this.gateHint ? 0.35 + Math.sin(t * 5) * 0.3 : 0;
      if (this.sleeve) {
        const target = this.locked ? -0.12 : 0;
        const y = this.sleeve.position.y - this.sleeveBase.y;
        const ny = y + (target - y) * Math.min(1, dt * 6);
        this.sleeve.position.y = this.sleeveBase.y + ny;
        if (Math.abs(target - ny) > 0.002) this.sleeve.rotation.y += dt * 12;
      }
    }
    this.stepGroup.children.forEach((o) => {
      if (o.userData.current) o.scale.setScalar(1 + Math.sin(t * 4) * 0.18);
    });
    // Resaltar el chicote cuando todavía hay que moverlo
    this.tipHalo.visible = !this.def.staged && this.phase !== "done" && !this.dragging;
    this.tipHalo.quaternion.copy(this.camera.quaternion);
    this.tipHalo.scale.setScalar(1 + Math.sin(t * 4) * 0.15);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}
