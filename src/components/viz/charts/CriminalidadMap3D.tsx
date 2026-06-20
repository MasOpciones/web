import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import dataJson from "../../../data/criminalidad_distritos.json";
import geoJson from "../../../data/criminalidad_distritos_geo.json";

// ── Tipos ─────────────────────────────────────────────────────────────────

interface DistritoDatos {
  [tipo: string]: number;
}

interface Distrito {
  codigo: string;
  nombre: string;
  canton: string;
  provincia: string;
  lat: number;
  lng: number;
  poblacion: number;
  datos: Record<string, DistritoDatos>;
  advertencia_poblacion?: boolean;
  advertencia_texto?: string;
}

interface DataFile {
  meta: { años: number[]; tipos_delito: string[]; metricas: string[] };
  distritos: Distrito[];
}

interface GeoFile {
  [codigo: string]: { poligonos: number[][][][] };
}

const data = dataJson as unknown as DataFile;
const geo = geoJson as unknown as GeoFile;
const DISTRITOS_POR_CODIGO = new Map(data.distritos.map((distrito) => [distrito.codigo, distrito]));

type Metrica = "conteo" | "tasa_por_10k" | "crecimiento_pct";

const PROVINCIAS = ["SAN JOSE", "ALAJUELA", "CARTAGO", "HEREDIA", "GUANACASTE", "PUNTARENAS", "LIMON"];
const PROVINCIA_LABEL: Record<string, string> = {
  "SAN JOSE": "San José",
  ALAJUELA: "Alajuela",
  CARTAGO: "Cartago",
  HEREDIA: "Heredia",
  GUANACASTE: "Guanacaste",
  PUNTARENAS: "Puntarenas",
  LIMON: "Limón",
};
const TIPO_LABEL: Record<string, string> = {
  TODOS: "Todos",
  HURTO: "Hurto",
  ASALTO: "Asalto",
  ROBO: "Robo",
  "ROBO DE VEHICULO": "Robo de vehículo",
  "TACHA DE VEHICULO": "Tacha",
  HOMICIDIO: "Homicidio",
};
const LABEL_DELITO: Record<string, string> = {
  TODOS: "delitos",
  HURTO: "hurtos",
  ASALTO: "asaltos",
  ROBO: "robos",
  "ROBO DE VEHICULO": "robos de veh\u00EDculo",
  "TACHA DE VEHICULO": "tachas de veh\u00EDculo",
  HOMICIDIO: "homicidios",
};
const METRICA_LABEL: Record<Metrica, string> = {
  conteo: "Conteo absoluto",
  tasa_por_10k: "Tasa por 10.000 hab.",
  crecimiento_pct: "Crecimiento % vs año base",
};

// ── Geometria de poligonos: el GeoJSON fuente no siempre trae el anillo
// exterior real en el indice 0 (algunos distritos costeros traen primero un
// anillo degenerado de area casi nula). Por eso nunca se debe asumir
// poligono[0]: hay que elegir el anillo de mayor area en cada caso, tanto
// para dibujar como para calcular centroides (posicion de las barras). ──────

function anilloArea(anillo: number[][]): number {
  let a = 0;
  for (let i = 0; i < anillo.length - 1; i++) {
    const [x1, y1] = anillo[i];
    const [x2, y2] = anillo[i + 1];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

function anilloCentroide(anillo: number[][]): [number, number] {
  let aTotal = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < anillo.length - 1; i++) {
    const [x1, y1] = anillo[i];
    const [x2, y2] = anillo[i + 1];
    const cross = x1 * y2 - x2 * y1;
    aTotal += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  if (Math.abs(aTotal) < 1e-9) {
    const xs = anillo.map((p) => p[0]);
    const ys = anillo.map((p) => p[1]);
    return [xs.reduce((a, b) => a + b, 0) / xs.length, ys.reduce((a, b) => a + b, 0) / ys.length];
  }
  aTotal /= 2;
  return [cx / (6 * aTotal), cy / (6 * aTotal)];
}

function anilloPrincipal(poligono: number[][][]): number[][] | null {
  let mejor: number[][] | null = null;
  let mejorArea = -1;
  for (const anillo of poligono) {
    if (!anillo || anillo.length < 3) continue;
    const a = anilloArea(anillo);
    if (a > mejorArea) {
      mejorArea = a;
      mejor = anillo;
    }
  }
  return mejor;
}

// ── Proyeccion geografica (equirectangular simple, centrada en CR) ──────────
// Bounds calculados a partir del GeoJSON real (no hardcodeados). Isla del
// Coco (codigo 60110) se excluye del calculo de bounds: esta a ~500km de la
// costa y si se incluye, comprime todo el territorio continental a una
// fraccion minuscula del mapa.

const ISLA_DEL_COCO_CODIGO = "60110";

function calcularBounds() {
  let lngMin = Infinity;
  let lngMax = -Infinity;
  let latMin = Infinity;
  let latMax = -Infinity;
  for (const codigo in geo) {
    if (codigo === ISLA_DEL_COCO_CODIGO) continue;
    for (const poligono of geo[codigo].poligonos) {
      for (const anillo of poligono) {
        for (const [lng, lat] of anillo) {
          if (lng < lngMin) lngMin = lng;
          if (lng > lngMax) lngMax = lng;
          if (lat < latMin) latMin = lat;
          if (lat > latMax) latMax = lat;
        }
      }
    }
  }
  return { lngMin, lngMax, latMin, latMax };
}

const BOUNDS = calcularBounds();
const CENTER_LNG = (BOUNDS.lngMin + BOUNDS.lngMax) / 2;
const CENTER_LAT = (BOUNDS.latMin + BOUNDS.latMax) / 2;
const SCALE = 20 / (BOUNDS.lngMax - BOUNDS.lngMin);
const LAT_CORR = Math.cos((CENTER_LAT * Math.PI) / 180);
const MAX_BAR_HEIGHT = 6;
const BAR_FOOTPRINT = 0.18;

// Limites de paneo: no dejar que el punto de orbita se aleje indefinidamente
// del mapa (mitad del ancho/alto del mapa + un margen de respiro).
const PAN_MARGIN = 6;
const PAN_LIMIT_X = 10 + PAN_MARGIN;
const PAN_LIMIT_Z = ((BOUNDS.latMax - BOUNDS.latMin) / 2) * SCALE * LAT_CORR + PAN_MARGIN;

function project(lng: number, lat: number): [number, number] {
  const x = (lng - CENTER_LNG) * SCALE;
  const z = -(lat - CENTER_LAT) * SCALE * LAT_CORR;
  return [x, z];
}

// Posicion real de cada distrito: se deriva del anillo de mayor area de su
// geometria (no del lat/lng precalculado en el JSON de datos), porque ese
// precalculo hereda el mismo bug del anillo equivocado para los distritos
// costeros afectados (ej. Cano Negro caia con centroide en el Pacifico).
const ANCLA_DISTRITO = new Map<string, [number, number]>();
for (const d of data.distritos) {
  let mejorAnillo: number[][] | null = null;
  let mejorArea = -1;
  const g = geo[d.codigo];
  if (g) {
    for (const poligono of g.poligonos) {
      const anillo = anilloPrincipal(poligono);
      if (!anillo) continue;
      const a = anilloArea(anillo);
      if (a > mejorArea) {
        mejorArea = a;
        mejorAnillo = anillo;
      }
    }
  }
  ANCLA_DISTRITO.set(d.codigo, mejorAnillo ? anilloCentroide(mejorAnillo) : [d.lng, d.lat]);
}

// ── Paleta tema-aware ────────────────────────────────────────────────────
const BAR_COLOR_LOW = new THREE.Color("#FFF1D6");
const BAR_COLOR_HIGH = new THREE.Color("#60FF12");

// La escala va de crema suave para menor peligro a verde neón para mayor peligro.
function getBarColor(intensity: number): THREE.Color {
  const t = Math.max(0, Math.min(1, intensity));
  return BAR_COLOR_LOW.clone().lerp(BAR_COLOR_HIGH, t);
}

function getIsDark() {
  return !document.documentElement.classList.contains("light");
}

function cantonKey(provincia: string, canton: string) {
  return `${provincia}::${canton}`;
}

// ── Calculo de valores por metrica ──────────────────────────────────────

function valorDistrito(d: Distrito, anio: number, anioBase: number, tipo: string, metrica: Metrica): number | null {
  const fila = d.datos[String(anio)];
  if (!fila) return null;
  const raw = fila[tipo] ?? 0;
  if (metrica === "conteo") return raw;
  if (metrica === "tasa_por_10k") return d.poblacion > 0 ? (raw / d.poblacion) * 10000 : null;
  const filaBase = d.datos[String(anioBase)];
  const base = filaBase ? filaBase[tipo] ?? 0 : 0;
  if (base === 0) return null;
  return ((raw - base) / base) * 100;
}

function formatoValor(v: number | null, metrica: Metrica): string {
  if (v === null) return "N/D";
  if (metrica === "tasa_por_10k") return v.toFixed(1);
  if (metrica === "crecimiento_pct") return (v > 0 ? "+" : "") + v.toFixed(1) + "%";
  return Math.round(v).toLocaleString("es-CR");
}

const ADVERTENCIA_POBLACION_TEXTO =
  "Este distrito combina una poblaci\u00F3n residente at\u00EDpicamente baja y una tasa por habitante alta. La tasa puede estar inflada cuando parte de los delitos afecta a poblaci\u00F3n flotante, no solo a quienes viven aqu\u00ED.";

function percentil(valores: number[], percentilBuscado: number): number {
  const ordenados = [...valores].sort((a, b) => a - b);
  const posicion = (ordenados.length - 1) * percentilBuscado;
  const inferior = Math.floor(posicion);
  const superior = Math.ceil(posicion);
  if (inferior === superior) return ordenados[inferior];
  return ordenados[inferior] + (ordenados[superior] - ordenados[inferior]) * (posicion - inferior);
}

const DISTRITOS_CON_ADVERTENCIA_POBLACION = (() => {
  const referencia = data.distritos
    .map((distrito) => {
      const delitos = distrito.datos["2024"]?.TODOS;
      if (delitos === undefined || distrito.poblacion <= 0) return null;
      return {
        codigo: distrito.codigo,
        poblacion: distrito.poblacion,
        tasa: (delitos / distrito.poblacion) * 10000,
      };
    })
    .filter((distrito): distrito is { codigo: string; poblacion: number; tasa: number } => distrito !== null);
  const umbralTasa = percentil(referencia.map((distrito) => distrito.tasa), 0.9);
  const pisoPoblacion = percentil(referencia.map((distrito) => distrito.poblacion), 0.25);

  return new Set(
    referencia
      .filter((distrito) => distrito.tasa > umbralTasa && distrito.poblacion < pisoPoblacion)
      .map((distrito) => distrito.codigo)
  );
})();

function tieneAdvertenciaPoblacion(distrito: Distrito): boolean {
  return distrito.advertencia_poblacion === true || DISTRITOS_CON_ADVERTENCIA_POBLACION.has(distrito.codigo);
}

function textoAdvertenciaPoblacion(distrito: Distrito): string {
  return distrito.advertencia_texto || ADVERTENCIA_POBLACION_TEXTO;
}

// ── Componente ──────────────────────────────────────────────────────────

export default function CriminalidadMap3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [isDark, setIsDark] = useState(true);
  const [tipo, setTipo] = useState("TODOS");
  const [metrica, setMetrica] = useState<Metrica>("conteo");
  const [anio, setAnio] = useState(2024);
  const [anioBase, setAnioBase] = useState(2015);
  const [provinciasSel, setProvinciasSel] = useState<Set<string>>(new Set(PROVINCIAS));
  const [cantonesSel, setCantonesSel] = useState<Set<string> | null>(null);
  const [cantonesExpanded, setCantonesExpanded] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [rankingExpanded, setRankingExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hover, setHover] = useState<{ d: Distrito; valor: number | null; ranking: number; x: number; y: number } | null>(null);
  const [advertenciaTooltip, setAdvertenciaTooltip] = useState<{
    codigo: string;
    texto: string;
    x: number;
    y: number;
  } | null>(null);

  const cantonesPorProvincia = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const d of data.distritos) {
      if (!map.has(d.provincia)) map.set(d.provincia, new Set());
      map.get(d.provincia)!.add(d.canton);
    }
    return map;
  }, []);

  const cantonesDisponibles = useMemo(() => {
    return PROVINCIAS.flatMap((provincia) => {
      if (!provinciasSel.has(provincia)) return [];
      return Array.from(cantonesPorProvincia.get(provincia) ?? [])
        .sort()
        .map((canton) => ({ provincia, canton, key: cantonKey(provincia, canton) }));
    });
  }, [provinciasSel, cantonesPorProvincia]);

  useEffect(() => {
    if (provinciasSel.size === PROVINCIAS.length) {
      setCantonesSel(null);
      setCantonesExpanded(false);
      return;
    }

    setCantonesExpanded(true);
    setCantonesSel((prev) => {
      if (prev === null) return null;
      const disponibles = new Set(cantonesDisponibles.map((canton) => canton.key));
      const next = new Set(Array.from(prev).filter((key) => disponibles.has(key)));
      return next.size === 0 || next.size === disponibles.size ? null : next;
    });
  }, [provinciasSel, cantonesDisponibles]);

  const filtrados = useMemo(() => {
    const filtrarCanton = provinciasSel.size < PROVINCIAS.length && cantonesSel !== null;
    return data.distritos.filter(
      (d) =>
        provinciasSel.has(d.provincia) &&
        (!filtrarCanton || cantonesSel.has(cantonKey(d.provincia, d.canton)))
    );
  }, [provinciasSel, cantonesSel]);

  const valores = useMemo(() => {
    const map = new Map<string, number | null>();
    for (const d of filtrados) map.set(d.codigo, valorDistrito(d, anio, anioBase, tipo, metrica));
    return map;
  }, [filtrados, anio, anioBase, tipo, metrica]);

  // Escala fija: se calcula sobre TODOS los distritos (no solo los que
  // pasan el filtro geografico), para que la altura/color de las barras no
  // se redistribuya cuando el usuario solo cambia que provincias/cantones
  // estan visibles. El filtro geografico unicamente oculta barras.
  const valoresGlobal = useMemo(() => {
    const map = new Map<string, number | null>();
    for (const d of data.distritos) map.set(d.codigo, valorDistrito(d, anio, anioBase, tipo, metrica));
    return map;
  }, [anio, anioBase, tipo, metrica]);

  const totalNacional = useMemo(() => {
    return data.distritos.reduce((total, distrito) => total + (distrito.datos[String(anio)]?.[tipo] ?? 0), 0);
  }, [anio, tipo]);

  const { minVal, maxVal } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const v of valoresGlobal.values()) {
      if (v === null) continue;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    if (!isFinite(min) || !isFinite(max)) return { minVal: 0, maxVal: 1 };
    if (min === max) return { minVal: min - 1, maxVal: max + 1 };
    return { minVal: min, maxVal: max };
  }, [valoresGlobal]);

  const rankingList = useMemo(() => {
    return Array.from(valores.entries())
      .filter(([, valor]) => valor !== null)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .flatMap(([codigo, valor], index) => {
        const distrito = DISTRITOS_POR_CODIGO.get(codigo);
        return distrito ? [{ distrito, valor: valor as number, puesto: index + 1 }] : [];
      });
  }, [valores]);

  const ranking = useMemo(
    () => new Map(rankingList.map(({ distrito, puesto }) => [distrito.codigo, puesto])),
    [rankingList]
  );

  // refs Three.js que persisten entre renders
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    bars: Map<string, THREE.Mesh>;
    bgMaterial: THREE.MeshStandardMaterial;
    borderMaterial: THREE.LineBasicMaterial;
    bgMeshes: THREE.Mesh[];
    raycaster: THREE.Raycaster;
    ambientLight: THREE.AmbientLight;
    dirLight: THREE.DirectionalLight;
    fillLight: THREE.DirectionalLight;
  } | null>(null);

  // ── Setup inicial de Three.js (una sola vez) ──────────────────────────
  useEffect(() => {
    const wrap = canvasWrapRef.current;
    if (!wrap) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 1000);
    camera.position.set(0, 18, 22);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    wrap.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.minDistance = 16;
    controls.maxDistance = 55;
    // Rotacion azimutal libre (360°), pero sin permitir que la camara baje
    // del plano del suelo y mire el mapa desde abajo.
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controls.screenSpacePanning = true;
    controls.update();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(-10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.bias = -0.001;
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.2);
    fillLight.position.set(10, 5, -5);
    scene.add(ambientLight, dirLight, fillLight);

    // Fondo: poligonos de distrito extruidos (volumen real, con bisel)
    const extrudeSettings = { depth: 0.04, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.003, bevelSegments: 1 };
    const bgMaterial = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.0 });
    const bgMeshes: THREE.Mesh[] = [];
    const bgGroup = new THREE.Group();
    bgGroup.rotation.x = -Math.PI / 2;
    for (const d of data.distritos) {
      const g = geo[d.codigo];
      if (!g) continue;
      for (const poligono of g.poligonos) {
        const anillo = anilloPrincipal(poligono);
        if (!anillo) continue;
        const pts = anillo.map(([lng, lat]) => {
          const [x, z] = project(lng, lat);
          return new THREE.Vector2(x, -z);
        });
        const shape = new THREE.Shape(pts);
        const shapeGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        // La extrusion crece en +Z local desde 0; se corre para que la cara
        // visible (la de arriba) quede en z=0 local -> y=0 mundo, al ras de
        // donde arrancan las barras.
        shapeGeom.translate(0, 0, -extrudeSettings.depth);
        const mesh = new THREE.Mesh(shapeGeom, bgMaterial);
        mesh.receiveShadow = true;
        mesh.castShadow = false;
        bgGroup.add(mesh);
        bgMeshes.push(mesh);
      }
    }
    scene.add(bgGroup);

    // Bordes de distrito
    const borderMaterial = new THREE.LineBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.5 });
    const borderGroup = new THREE.Group();
    borderGroup.rotation.x = -Math.PI / 2;
    for (const d of data.distritos) {
      const g = geo[d.codigo];
      if (!g) continue;
      for (const poligono of g.poligonos) {
        const anillo = anilloPrincipal(poligono);
        if (!anillo) continue;
        const points = anillo.map(([lng, lat]) => {
          const [x, z] = project(lng, lat);
          return new THREE.Vector3(x, -z, 0.001);
        });
        const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
        borderGroup.add(new THREE.LineLoop(lineGeom, borderMaterial));
      }
    }
    scene.add(borderGroup);

    // Barras (una por distrito, geometria unitaria escalada en Y)
    const barGeom = new THREE.BoxGeometry(BAR_FOOTPRINT, 1, BAR_FOOTPRINT);
    const bars = new Map<string, THREE.Mesh>();
    for (const d of data.distritos) {
      const [ancLng, ancLat] = ANCLA_DISTRITO.get(d.codigo) ?? [d.lng, d.lat];
      const [x, z] = project(ancLng, ancLat);
      const material = new THREE.MeshStandardMaterial({ color: 0x60ff12, roughness: 0.3, metalness: 0.1 });
      const mesh = new THREE.Mesh(barGeom, material);
      mesh.position.set(x, 0, z);
      mesh.scale.y = 0.0001;
      mesh.visible = false;
      mesh.castShadow = true;
      mesh.receiveShadow = false;
      mesh.userData.codigo = d.codigo;
      scene.add(mesh);
      bars.set(d.codigo, mesh);
    }

    const raycaster = new THREE.Raycaster();
    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      bars,
      bgMaterial,
      borderMaterial,
      bgMeshes,
      raycaster,
      ambientLight,
      dirLight,
      fillLight,
    };

    let raf = 0;
    const animate = () => {
      // El paneo puede mover el punto de orbita fuera del plano del suelo
      // (rompiendo el limite de maxPolarAngle, que es relativo al target) o
      // alejarlo del mapa indefinidamente. Se fija cada frame para que la
      // camara nunca baje del suelo ni se pueda panear al infinito.
      controls.target.y = 0;
      controls.target.x = Math.max(-PAN_LIMIT_X, Math.min(PAN_LIMIT_X, controls.target.x));
      controls.target.z = Math.max(-PAN_LIMIT_Z, Math.min(PAN_LIMIT_Z, controls.target.z));
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!wrap) return;
      camera.aspect = wrap.clientWidth / wrap.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      barGeom.dispose();
      bgMaterial.dispose();
      borderMaterial.dispose();
      bars.forEach((m) => (m.material as THREE.Material).dispose());
      if (wrap.contains(renderer.domElement)) wrap.removeChild(renderer.domElement);
    };
  }, []);

  // ── Tema: deteccion + observer ─────────────────────────────────────────
  useEffect(() => {
    setIsDark(getIsDark());
    const obs = new MutationObserver(() => setIsDark(getIsDark()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(document.fullscreenElement === wrapRef.current);
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  useEffect(() => {
    const ctx = sceneRef.current;
    if (!ctx) return;
    ctx.bgMaterial.color.set(isDark ? "#1c1c1c" : "#f8f8f8");
    ctx.bgMaterial.roughness = isDark ? 0.85 : 0.9;
    ctx.borderMaterial.color.set(isDark ? "#2e2e2e" : "#e0e0e0");
    ctx.renderer.setClearColor(isDark ? 0x0a0a0a : 0xffffff, 1);
    ctx.ambientLight.intensity = isDark ? 0.3 : 0.5;
    ctx.dirLight.intensity = isDark ? 1.2 : 1.5;
    ctx.fillLight.intensity = isDark ? 0.2 : 0.3;
  }, [isDark]);

  // ── Sincronizar barras visibles/altura/color con filtros + tema ───────
  useEffect(() => {
    const ctx = sceneRef.current;
    if (!ctx) return;
    const filtradosSet = new Set(filtrados.map((d) => d.codigo));
    for (const [codigo, mesh] of ctx.bars) {
      if (!filtradosSet.has(codigo)) {
        mesh.visible = false;
        continue;
      }
      // El valor y la escala (minVal/maxVal) vienen siempre del dataset
      // completo: el filtro geografico solo decide visibilidad, nunca
      // recalcula la altura relativa de las barras.
      const v = valoresGlobal.get(codigo);
      if (v === null || v === undefined || v <= 0) {
        mesh.visible = false;
        continue;
      }
      const t = (v - minVal) / (maxVal - minVal || 1);
      const h = Math.max(0.02, t * MAX_BAR_HEIGHT);
      mesh.visible = true;
      mesh.scale.y = h;
      mesh.position.y = h / 2;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.color.copy(getBarColor(t));
      material.emissive.copy(BAR_COLOR_HIGH);
      material.emissiveIntensity = isDark ? t * 0.25 : 0;
    }
  }, [filtrados, valoresGlobal, minVal, maxVal, isDark]);

  // ── Hover / tooltip ─────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = sceneRef.current;
    const wrap = canvasWrapRef.current;
    if (!ctx || !wrap) return;

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      ctx.raycaster.setFromCamera(mouse, ctx.camera);
      const visibles = Array.from(ctx.bars.values()).filter((m) => m.visible);
      const hits = ctx.raycaster.intersectObjects(visibles, false);
      if (hits.length === 0) {
        setHover(null);
        return;
      }
      const codigo = hits[0].object.userData.codigo as string;
      const d = data.distritos.find((x) => x.codigo === codigo);
      if (!d) return;
      setHover({
        d,
        valor: valores.get(codigo) ?? null,
        ranking: ranking.get(codigo) ?? 0,
        x: e.clientX,
        y: e.clientY,
      });
    };
    const onLeave = (e: PointerEvent) => {
      if (e.relatedTarget instanceof Node && tooltipRef.current?.contains(e.relatedTarget)) return;
      setHover(null);
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [valores, ranking]);

  function posicionAdvertencia(distrito: Distrito, elemento: HTMLElement) {
    const rect = elemento.getBoundingClientRect();
    return {
      codigo: distrito.codigo,
      texto: textoAdvertenciaPoblacion(distrito),
      x: Math.max(8, Math.min(rect.left, window.innerWidth - 276)),
      y: Math.min(rect.bottom + 8, window.innerHeight - 120),
    };
  }

  function mostrarAdvertencia(distrito: Distrito, elemento: HTMLElement) {
    setAdvertenciaTooltip(posicionAdvertencia(distrito, elemento));
  }

  function ocultarAdvertencia(codigo: string) {
    setAdvertenciaTooltip((actual) => (actual?.codigo === codigo ? null : actual));
  }

  function alternarAdvertencia(distrito: Distrito, elemento: HTMLElement) {
    setAdvertenciaTooltip((actual) => (actual?.codigo === distrito.codigo ? null : posicionAdvertencia(distrito, elemento)));
  }

  function IconoAdvertencia({ distrito }: { distrito: Distrito }) {
    return (
      <button
        type="button"
        className="warning-marker warning-marker-button"
        aria-label="Advertencia de poblaci\u00F3n residencial"
        aria-expanded={advertenciaTooltip?.codigo === distrito.codigo}
        onPointerEnter={(evento) => {
          if (evento.pointerType === "mouse") mostrarAdvertencia(distrito, evento.currentTarget);
        }}
        onPointerLeave={(evento) => {
          if (evento.pointerType === "mouse") ocultarAdvertencia(distrito.codigo);
        }}
        onClick={(evento) => alternarAdvertencia(distrito, evento.currentTarget)}
      >
        &#9888;
      </button>
    );
  }

  function toggleProvincia(prov: string) {
    setProvinciasSel((prev) => {
      if (prev.size === PROVINCIAS.length) return new Set([prov]);
      const next = new Set(prev);
      if (next.has(prov)) {
        next.delete(prov);
      } else {
        next.add(prov);
      }
      if (next.size === 0 || next.size === PROVINCIAS.length) return new Set(PROVINCIAS);
      return next;
    });
  }

  function seleccionarTodasProvincias() {
    setProvinciasSel(new Set(PROVINCIAS));
    setCantonesSel(null);
  }

  function toggleCanton(key: string) {
    setCantonesSel((prev) => {
      if (prev === null) return new Set([key]);
      const base = prev;
      const next = new Set(base);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      if (next.size === 0 || next.size === cantonesDisponibles.length) return null;
      return next;
    });
  }

  function resetFiltros() {
    setTipo("TODOS");
    setMetrica("conteo");
    setAnio(2024);
    setAnioBase(2015);
    seleccionarTodasProvincias();
  }

  function seleccionarTodosCantones() {
    setCantonesSel(null);
  }

  function toggleFullscreen() {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (document.fullscreenElement === wrap) {
      void document.exitFullscreen();
      return;
    }
    void wrap.requestFullscreen?.();
  }

  function toggleFiltersPanel() {
    const isMobileFullscreen =
      document.fullscreenElement === wrapRef.current && window.matchMedia("(max-width: 767px)").matches;
    if (isMobileFullscreen) setRankingExpanded(false);
    setFiltersCollapsed((v) => !v);
  }

  function toggleRankingPanel() {
    const isMobileFullscreen =
      document.fullscreenElement === wrapRef.current && window.matchMedia("(max-width: 767px)").matches;
    if (isMobileFullscreen) setFiltersCollapsed(true);
    setMobileFiltersOpen(false);
    setRankingExpanded((v) => !v);
  }

  const todasProvinciasActivas = provinciasSel.size === PROVINCIAS.length;
  const cantonesActivos = cantonesSel ?? new Set(cantonesDisponibles.map((canton) => canton.key));
  const anioMin = 2015;
  const anioMax = 2026;

  return (
    <div
      ref={wrapRef}
      className={`criminalidad-map3d${mobileFiltersOpen ? " filters-open" : ""}${filtersCollapsed ? " filters-collapsed" : ""}${rankingExpanded ? " ranking-open" : ""}`}
    >
      <style>{`
        .criminalidad-map3d {
          height: min(80vh, 680px);
          min-height: 560px;
          margin-top: 1.2rem;
          position: relative;
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg);
          box-shadow: var(--viz-shadow);
        }

        .criminalidad-layout {
          display: flex;
          width: 100%;
          height: 100%;
        }

        .criminalidad-controls {
          width: 280px;
          flex: 0 0 280px;
          height: 100%;
          background: var(--panel);
          border-right: 1px solid var(--border);
          padding: 20px 16px;
          overflow-y: auto;
          font-family: var(--font-sans);
          color: var(--text);
          z-index: 3;
          scrollbar-width: thin;
          scrollbar-color: var(--accent) var(--bg);
          transition: width 220ms ease, flex-basis 220ms ease, padding 220ms ease, border-color 220ms ease;
        }

        .criminalidad-controls::-webkit-scrollbar {
          width: 8px;
        }

        .criminalidad-controls::-webkit-scrollbar-track {
          background: var(--bg);
          border-left: 1px solid var(--border);
        }

        .criminalidad-controls::-webkit-scrollbar-thumb {
          background: var(--accent);
          border: 2px solid var(--bg);
          border-radius: 8px;
        }

        .criminalidad-controls::-webkit-scrollbar-thumb:hover {
          background: #78ff3d;
        }

        .criminalidad-controls.is-collapsed {
          width: 0;
          flex-basis: 0;
          padding-right: 0;
          padding-left: 0;
          overflow: hidden;
          border-right-color: transparent;
          pointer-events: none;
        }

        .ranking-panel {
          width: 0;
          flex: 0 0 0;
          height: 100%;
          overflow: hidden;
          border-left: 1px solid transparent;
          background: var(--panel);
          opacity: 0;
          pointer-events: none;
          transition: width 220ms ease, flex-basis 220ms ease, border-color 220ms ease, opacity 160ms ease;
        }

        .ranking-panel.is-open {
          width: 280px;
          flex-basis: 280px;
          border-left-color: var(--border);
          opacity: 1;
          pointer-events: auto;
        }

        .ranking-panel-inner {
          display: flex;
          width: 280px;
          height: 100%;
          flex-direction: column;
          font-family: var(--font-sans);
          color: var(--text);
        }

        .ranking-panel-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 10px;
          padding: 20px 16px 12px;
          border-bottom: 1px solid var(--border);
        }

        .ranking-panel-title {
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .ranking-panel-count {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .ranking-list {
          flex: 1 1 auto;
          min-height: 0;
          margin: 0;
          padding: 0 16px;
          overflow-y: auto;
          list-style: none;
          scrollbar-width: thin;
          scrollbar-color: var(--accent) var(--bg);
        }

        .ranking-list::-webkit-scrollbar {
          width: 8px;
        }

        .ranking-list::-webkit-scrollbar-track {
          background: var(--bg);
          border-left: 1px solid var(--border);
        }

        .ranking-list::-webkit-scrollbar-thumb {
          background: var(--accent);
          border: 2px solid var(--bg);
          border-radius: 8px;
        }

        .ranking-item {
          display: grid;
          grid-template-columns: 28px minmax(0, 1fr) auto;
          gap: 8px;
          align-items: center;
          min-height: 52px;
          border-bottom: 1px solid var(--border);
        }

        .ranking-number {
          color: var(--accent);
          font-size: 12px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .ranking-place {
          min-width: 0;
          font-size: 12px;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .warning-marker {
          display: inline-flex;
          align-items: center;
          margin-left: 4px;
          color: #facc15;
          font-size: 0.85em;
          line-height: 1;
          vertical-align: middle;
        }

        .warning-marker-button {
          padding: 0;
          border: 0;
          background: transparent;
          cursor: help;
        }

        .warning-marker-tooltip {
          position: fixed;
          z-index: 40;
          width: min(260px, 70vw);
          padding: 9px 11px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--viz-tooltip-bg);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.2);
          color: var(--text);
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 400;
          line-height: 1.4;
          text-align: left;
          white-space: normal;
          pointer-events: none;
        }

        .ranking-location {
          margin-top: 2px;
          color: var(--text-muted);
          font-size: 10px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ranking-value {
          color: var(--text);
          font-size: 12px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          text-align: right;
        }

        .ranking-empty {
          padding: 18px 0;
          color: var(--text-muted);
          font-size: 12px;
        }

        .controls-toggle {
          position: absolute;
          top: 14px;
          left: 292px;
          z-index: 6;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 32px;
          padding: 0 9px;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: var(--panel);
          color: var(--text);
          font-family: var(--font-sans);
          font-size: 12px;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
          transition: left 220ms ease, border-color 160ms ease, color 160ms ease;
        }

        .controls-toggle:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .controls-toggle-icon {
          font-size: 16px;
          line-height: 1;
        }

        .ranking-toggle {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 6;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 32px;
          padding: 0 9px;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: var(--panel);
          color: var(--text);
          font-family: var(--font-sans);
          font-size: 12px;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
          transition: right 220ms ease, border-color 160ms ease, color 160ms ease;
        }

        .ranking-toggle:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .criminalidad-map3d.ranking-open .ranking-toggle {
          right: 292px;
        }

        .fullscreen-toggle {
          position: absolute;
          right: 14px;
          bottom: 56px;
          z-index: 6;
          display: inline-flex;
          width: 32px;
          height: 32px;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: var(--panel);
          color: var(--text);
          font-family: var(--font-sans);
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
          transition: right 220ms ease, border-color 160ms ease, color 160ms ease;
        }

        .fullscreen-toggle:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .fullscreen-corners {
          position: relative;
          display: block;
          width: 16px;
          height: 16px;
        }

        .fullscreen-corners::before,
        .fullscreen-corners::after {
          content: "";
          position: absolute;
          width: 7px;
          height: 7px;
          border-color: currentColor;
          border-style: solid;
          border-width: 0;
        }

        .fullscreen-corners::before {
          top: 0;
          right: 0;
          border-top-width: 2px;
          border-right-width: 2px;
        }

        .fullscreen-corners::after {
          bottom: 0;
          left: 0;
          border-bottom-width: 2px;
          border-left-width: 2px;
        }

        .fullscreen-corners.is-active::before {
          right: auto;
          left: 0;
          border-right-width: 0;
          border-left-width: 2px;
        }

        .fullscreen-corners.is-active::after {
          right: 0;
          left: auto;
          border-right-width: 2px;
          border-left-width: 0;
        }

        .criminalidad-map3d.ranking-open .fullscreen-toggle {
          right: 304px;
        }

        .criminalidad-map3d.filters-collapsed .controls-toggle {
          left: 14px;
        }

        .criminalidad-controls button,
        .criminalidad-controls select,
        .criminalidad-controls input {
          font-family: var(--font-sans);
        }

        .control-section {
          margin-bottom: 20px;
        }

        .control-eyebrow {
          font-size: 11px;
          line-height: 1.2;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .control-rule {
          border-top: 1px solid var(--border);
          margin: 6px 0 10px;
        }

        .control-radio-list {
          display: flex;
          flex-direction: column;
        }

        .control-radio {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 0;
          cursor: pointer;
          border: 0;
          background: transparent;
          color: var(--text);
          text-align: left;
        }

        .control-radio-mark {
          width: 14px;
          height: 14px;
          border: 1.5px solid var(--border);
          border-radius: 50%;
          flex-shrink: 0;
          position: relative;
        }

        .control-radio.is-active .control-radio-mark {
          border-color: var(--accent);
        }

        .control-radio.is-active .control-radio-mark::after {
          content: "";
          position: absolute;
          width: 6px;
          height: 6px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: var(--accent);
        }

        .control-radio-label {
          font-size: 13px;
          font-weight: 400;
          color: var(--text);
        }

        .control-radio:hover .control-radio-label {
          color: var(--accent);
        }

        .base-year-selector,
        .cantones-selector {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: opacity 180ms ease, max-height 220ms ease;
        }

        .base-year-selector.is-visible {
          max-height: 72px;
          opacity: 1;
          margin-top: 10px;
        }

        .base-year-label {
          display: block;
          margin-bottom: 6px;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .base-year-select {
          width: 100%;
          background: var(--bg);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 5px 8px;
          font-size: 13px;
        }

        .year-readout {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 8px;
        }

        .year-number {
          font-size: 28px;
          font-weight: 700;
          color: var(--accent);
          line-height: 1;
        }

        .year-partial {
          font-size: 11px;
          color: var(--text-muted);
        }

        .year-slider {
          width: 100%;
          -webkit-appearance: none;
          appearance: none;
          height: 2px;
          background: var(--border);
          border-radius: 2px;
          outline: none;
          display: block;
        }

        .year-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: none;
        }

        .year-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: none;
        }

        .year-limits {
          display: flex;
          justify-content: space-between;
          margin-top: 7px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .pill-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .filter-pill {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          border-radius: 4px;
          padding: 4px 10px;
          font-size: 12px;
          line-height: 1.2;
          cursor: pointer;
        }

        .filter-pill.is-active {
          background: transparent;
          border-color: var(--accent);
          color: var(--accent);
          font-weight: 500;
        }

        .filter-pill:not(.is-active):hover {
          border-color: var(--text-muted);
          color: var(--text);
        }

        .filter-pill.is-small {
          font-size: 11px;
          padding: 3px 8px;
        }

        .cantones-toggle {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
          padding: 7px 0;
          border: 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: transparent;
          color: var(--text);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .cantones-toggle:hover {
          color: var(--accent);
        }

        .cantones-toggle-mark {
          color: var(--accent);
          font-size: 16px;
          line-height: 1;
        }

        .cantones-selector.is-visible {
          max-height: 2000px;
          opacity: 1;
          margin-top: 10px;
        }

        .canton-group + .canton-group {
          margin-top: 10px;
        }

        .canton-group-label {
          margin-bottom: 6px;
          color: var(--text-muted);
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .reset-filters {
          width: 100%;
          padding: 8px 0;
          border: none;
          background: none;
          color: var(--text-muted);
          font-size: 12px;
          text-align: center;
          cursor: pointer;
        }

        .reset-filters:hover {
          color: var(--text);
        }

        .criminalidad-stage {
          min-width: 0;
          flex: 1 1 auto;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg);
        }

        .criminalidad-canvas {
          position: relative;
          width: 100%;
          flex: 1 1 auto;
          min-height: 0;
        }

        .criminalidad-legend {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          padding: 12px 18px;
          border-top: 1px solid var(--border);
          font-family: var(--font-sans);
          font-size: 11px;
          color: var(--text-muted);
          background: var(--panel);
        }

        .legend-scale {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .legend-gradient {
          width: 120px;
          height: 8px;
          border-radius: 4px;
          flex: 0 0 120px;
        }

        .criminalidad-tooltip {
          position: fixed;
          background: var(--viz-tooltip-bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 9px 11px;
          font-family: var(--font-sans);
          font-size: 12px;
          color: var(--text);
          pointer-events: auto;
          z-index: 20;
          backdrop-filter: blur(6px);
          min-width: 160px;
        }

        .criminalidad-tooltip-title {
          font-weight: 700;
        }

        .criminalidad-tooltip-muted {
          color: var(--text-muted);
          font-size: 11px;
          margin-bottom: 5px;
        }

        .filter-fab {
          display: none;
        }

        @media (max-width: 767px) {
          .criminalidad-map3d {
            height: min(82vh, 640px);
            min-height: 520px;
          }

          .criminalidad-layout {
            display: block;
          }

          .criminalidad-stage {
            width: 100%;
            height: 100%;
          }

          .criminalidad-controls {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: min(82%, 520px);
            border-right: 0;
            border-top: 1px solid var(--border);
            transform: translateY(calc(100% + 12px));
            transition: transform 220ms ease;
            box-shadow: 0 -18px 40px rgba(0, 0, 0, 0.24);
          }

          .criminalidad-controls.is-collapsed {
            width: 100%;
            flex-basis: auto;
            padding: 20px 16px;
            border-right-color: transparent;
            pointer-events: auto;
          }

          .criminalidad-controls.is-open {
            transform: translateY(0);
          }

          .ranking-panel {
            position: absolute;
            right: 0;
            bottom: 0;
            left: 0;
            width: 100%;
            height: min(82%, 520px);
            flex-basis: auto;
            transform: translateY(calc(100% + 12px));
            border-top: 1px solid var(--border);
            border-left: 0;
            opacity: 1;
            pointer-events: none;
            box-shadow: 0 -18px 40px rgba(0, 0, 0, 0.24);
            transition: transform 220ms ease;
          }

          .ranking-panel.is-open {
            width: 100%;
            flex-basis: auto;
            transform: translateY(0);
            border-top-color: var(--border);
            pointer-events: auto;
          }

          .criminalidad-map3d.filters-open .filter-fab {
            bottom: calc(min(82%, 520px) + 12px);
          }

          .criminalidad-map3d.ranking-open .ranking-toggle {
            bottom: calc(min(82%, 520px) + 12px);
          }

          .criminalidad-map3d.filters-open .ranking-toggle,
          .criminalidad-map3d.ranking-open .filter-fab {
            display: none;
          }

          .filter-fab {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            right: 16px;
            bottom: 86px;
            z-index: 5;
            min-height: 36px;
            padding: 0 12px;
            border: 1px solid var(--border);
            border-radius: 4px;
            background: var(--panel);
            color: var(--text);
            font-family: var(--font-sans);
            font-size: 12px;
            cursor: pointer;
            box-shadow: 0 8px 22px rgba(0, 0, 0, 0.24);
          }

          .ranking-toggle {
            top: auto;
            right: auto;
            bottom: 86px;
            left: 16px;
            min-height: 36px;
            box-shadow: 0 8px 22px rgba(0, 0, 0, 0.24);
          }

          .fullscreen-toggle {
            display: none;
          }

          .controls-toggle {
            display: none;
          }
        }

        .criminalidad-map3d:fullscreen {
          width: 100vw;
          height: 100dvh;
          min-height: 0;
          margin: 0;
          border: 0;
          border-radius: 0;
        }

        .criminalidad-map3d:fullscreen .criminalidad-layout {
          position: relative;
          display: block;
        }

        .criminalidad-map3d:fullscreen .criminalidad-stage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .criminalidad-map3d:fullscreen .criminalidad-controls {
          position: absolute;
          top: 64px;
          bottom: 64px;
          left: 24px;
          width: min(280px, calc(100% - 48px));
          height: auto;
          flex: 0 0 280px;
          padding: 20px 16px;
          transform: translateX(0);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
          transition: transform 220ms ease, opacity 160ms ease;
          z-index: 4;
        }

        .criminalidad-map3d:fullscreen .criminalidad-controls.is-collapsed {
          width: min(280px, calc(100% - 48px));
          flex-basis: 280px;
          padding: 20px 16px;
          transform: translateX(calc(-100% - 48px));
          border-color: var(--border);
          opacity: 0;
          pointer-events: none;
        }

        .criminalidad-map3d:fullscreen .ranking-panel {
          position: absolute;
          top: 64px;
          right: 24px;
          bottom: 64px;
          left: auto;
          width: min(280px, calc(100% - 48px));
          height: auto;
          flex: 0 0 280px;
          transform: translateX(calc(100% + 48px));
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
          opacity: 0;
          pointer-events: none;
          transition: transform 220ms ease, opacity 160ms ease;
          z-index: 4;
        }

        .criminalidad-map3d:fullscreen .ranking-panel.is-open {
          width: min(280px, calc(100% - 48px));
          flex-basis: 280px;
          transform: translateX(0);
          border-color: var(--border);
          opacity: 1;
          pointer-events: auto;
        }

        .criminalidad-map3d:fullscreen .controls-toggle {
          display: inline-flex;
          top: 24px;
          left: 316px;
        }

        .criminalidad-map3d:fullscreen.filters-collapsed .controls-toggle {
          left: 24px;
        }

        .criminalidad-map3d:fullscreen .ranking-toggle {
          top: 24px;
          right: 24px;
          bottom: auto;
          left: auto;
        }

        .criminalidad-map3d:fullscreen.ranking-open .ranking-toggle {
          right: 316px;
        }

        .criminalidad-map3d:fullscreen .fullscreen-toggle {
          top: auto;
          right: 24px;
          bottom: 64px;
          left: auto;
        }

        .criminalidad-map3d:fullscreen .filter-fab {
          display: none;
        }

        .criminalidad-map3d:fullscreen.ranking-open .fullscreen-toggle {
          right: 328px;
        }

        @media (max-width: 767px) {
          .criminalidad-map3d:fullscreen.ranking-open .ranking-toggle {
            right: 24px;
          }

          .criminalidad-map3d:fullscreen.ranking-open .fullscreen-toggle {
            right: min(328px, calc(100% - 56px));
          }
        }
      `}</style>

      <div className="criminalidad-layout">
        <aside
          id="criminalidad-controls"
          className={`criminalidad-controls${mobileFiltersOpen ? " is-open" : ""}${filtersCollapsed ? " is-collapsed" : ""}`}
          aria-hidden={filtersCollapsed}
          inert={filtersCollapsed}
        >
          <section className="control-section">
            <div className="control-eyebrow">Tipo de delito</div>
            <div className="control-rule" />
            <div className="control-radio-list" role="radiogroup" aria-label="Tipo de delito">
              {data.meta.tipos_delito.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`control-radio${tipo === t ? " is-active" : ""}`}
                  role="radio"
                  aria-checked={tipo === t}
                  onClick={() => setTipo(t)}
                >
                  <span className="control-radio-mark" aria-hidden="true" />
                  <span className="control-radio-label">{TIPO_LABEL[t] ?? t}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="control-section">
            <div className="control-eyebrow">Métrica</div>
            <div className="control-rule" />
            <div className="control-radio-list" role="radiogroup" aria-label="Métrica">
              {(["conteo", "tasa_por_10k", "crecimiento_pct"] as Metrica[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`control-radio${metrica === m ? " is-active" : ""}`}
                  role="radio"
                  aria-checked={metrica === m}
                  onClick={() => setMetrica(m)}
                >
                  <span className="control-radio-mark" aria-hidden="true" />
                  <span className="control-radio-label">{METRICA_LABEL[m]}</span>
                </button>
              ))}
            </div>
            <div className={`base-year-selector${metrica === "crecimiento_pct" ? " is-visible" : ""}`} aria-hidden={metrica !== "crecimiento_pct"}>
              <label className="base-year-label" htmlFor="criminalidad-anio-base">
                Año base
              </label>
              <select
                id="criminalidad-anio-base"
                className="base-year-select"
                value={anioBase}
                onChange={(e) => setAnioBase(Number(e.currentTarget.value))}
              >
                {data.meta.años.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="control-section">
            <div className="control-eyebrow">Año</div>
            <div className="control-rule" />
            <div className="year-readout">
              <span className="year-number">{anio}</span>
              {anio === 2026 && <span className="year-partial">(parcial)</span>}
            </div>
            <input
              className="year-slider"
              type="range"
              min={anioMin}
              max={anioMax}
              step="1"
              value={anio}
              onChange={(e) => setAnio(Number(e.currentTarget.value))}
            />
            <div className="year-limits">
              <span>{anioMin}</span>
              <span>{anioMax}</span>
            </div>
          </section>

          <section className="control-section">
            <div className="control-eyebrow">Provincia / cantón</div>
            <div className="control-rule" />
            <div className="pill-wrap">
              <button
                type="button"
                className={`filter-pill${todasProvinciasActivas ? " is-active" : ""}`}
                onClick={seleccionarTodasProvincias}
              >
                Todas
              </button>
              {PROVINCIAS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`filter-pill${!todasProvinciasActivas && provinciasSel.has(p) ? " is-active" : ""}`}
                  onClick={() => toggleProvincia(p)}
                >
                  {PROVINCIA_LABEL[p]}
                </button>
              ))}
            </div>

            {!todasProvinciasActivas && (
              <>
                <button
                  type="button"
                  className="cantones-toggle"
                  aria-expanded={cantonesExpanded}
                  aria-controls="criminalidad-cantones"
                  onClick={() => setCantonesExpanded((v) => !v)}
                >
                  <span>Cantones</span>
                  <span className="cantones-toggle-mark" aria-hidden="true">
                    {cantonesExpanded ? "-" : "+"}
                  </span>
                </button>

                <div
                  id="criminalidad-cantones"
                  className={`cantones-selector${cantonesExpanded ? " is-visible" : ""}`}
                  aria-hidden={!cantonesExpanded}
                >
                  <div className="pill-wrap">
                    <button
                      type="button"
                      className={`filter-pill is-small${cantonesSel === null ? " is-active" : ""}`}
                      onClick={seleccionarTodosCantones}
                    >
                      Todos los cantones
                    </button>
                  </div>

                  {PROVINCIAS.filter((provincia) => provinciasSel.has(provincia)).map((provincia) => (
                    <div className="canton-group" key={provincia}>
                      <div className="canton-group-label">{PROVINCIA_LABEL[provincia]}</div>
                      <div className="pill-wrap">
                        {cantonesDisponibles
                          .filter((canton) => canton.provincia === provincia)
                          .map((canton) => (
                            <button
                              key={canton.key}
                              type="button"
                              className={`filter-pill is-small${cantonesSel !== null && cantonesActivos.has(canton.key) ? " is-active" : ""}`}
                              onClick={() => toggleCanton(canton.key)}
                            >
                              {canton.canton}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          <button type="button" className="reset-filters" onClick={resetFiltros}>
            ↺ Restablecer filtros
          </button>
        </aside>

        <section className="criminalidad-stage">
          <div
            ref={canvasWrapRef}
            className="criminalidad-canvas"
            style={{ background: isDark ? "#0a0a0a" : "#ffffff" }}
          />

          <div className="criminalidad-legend">
            <div className="legend-scale">
              <span>{formatoValor(minVal, metrica)}</span>
              <span
                className="legend-gradient"
                style={{
                  background: `linear-gradient(90deg, ${getBarColor(0).getStyle()}, ${getBarColor(0.5).getStyle()}, ${getBarColor(1).getStyle()})`,
                }}
              />
              <span>{formatoValor(maxVal, metrica)}</span>
            </div>
            <span>
              {formatoValor(totalNacional, "conteo")} {LABEL_DELITO[tipo] ?? "delitos"} en {anio} · {filtrados.length} distritos · OIJ / Poder Judicial de Costa Rica
            </span>
          </div>
        </section>

        <aside
          id="criminalidad-ranking"
          className={`ranking-panel${rankingExpanded ? " is-open" : ""}`}
          aria-hidden={!rankingExpanded}
          inert={!rankingExpanded}
        >
          <div className="ranking-panel-inner">
            <div className="ranking-panel-header">
              <span className="ranking-panel-title">Ranking</span>
              <span className="ranking-panel-count">{rankingList.length} distritos</span>
            </div>

            <ol className="ranking-list">
              {rankingList.map(({ distrito, valor, puesto }) => (
                <li className="ranking-item" key={distrito.codigo}>
                  <span className="ranking-number">{puesto}</span>
                  <div>
                    <div className="ranking-place">
                      {distrito.nombre}
                      {tieneAdvertenciaPoblacion(distrito) && <IconoAdvertencia distrito={distrito} />}
                    </div>
                    <div className="ranking-location">
                      {distrito.canton}, {PROVINCIA_LABEL[distrito.provincia] ?? distrito.provincia}
                    </div>
                  </div>
                  <span className="ranking-value">{formatoValor(valor, metrica)}</span>
                </li>
              ))}
              {rankingList.length === 0 && <li className="ranking-empty">No hay datos para estos filtros.</li>}
            </ol>
          </div>
        </aside>
      </div>

      <button
        type="button"
        className="controls-toggle"
        aria-controls="criminalidad-controls"
        aria-expanded={!filtersCollapsed}
        onClick={toggleFiltersPanel}
      >
        <span className="controls-toggle-icon" aria-hidden="true">
          {filtersCollapsed ? ">" : "<"}
        </span>
        <span>{filtersCollapsed ? "Filtros" : "Ocultar"}</span>
      </button>

      <button
        type="button"
        className="ranking-toggle"
        aria-controls="criminalidad-ranking"
        aria-expanded={rankingExpanded}
        onClick={toggleRankingPanel}
      >
        <span className="controls-toggle-icon" aria-hidden="true">
          {rankingExpanded ? ">" : "<"}
        </span>
        <span>{rankingExpanded ? "Ocultar" : "Ranking"}</span>
      </button>

      <button
        type="button"
        className="fullscreen-toggle"
        aria-label={isFullscreen ? "Salir de pantalla completa" : "Ver mapa en pantalla completa"}
        title={isFullscreen ? "Salir de pantalla completa" : "Ver mapa en pantalla completa"}
        onClick={toggleFullscreen}
      >
        <span className={`fullscreen-corners${isFullscreen ? " is-active" : ""}`} aria-hidden="true" />
      </button>

      <button
        type="button"
        className="filter-fab"
        aria-expanded={mobileFiltersOpen}
        onClick={() => {
          setFiltersCollapsed(false);
          setRankingExpanded(false);
          setMobileFiltersOpen((v) => !v);
        }}
      >
        {mobileFiltersOpen ? "Filtros ↓" : "Filtros ↑"}
      </button>

      {hover && (
        <div
          ref={tooltipRef}
          className="criminalidad-tooltip"
          style={{
            left: hover.x + 14,
            top: hover.y + 14,
          }}
        >
          <div className="criminalidad-tooltip-title">
            {hover.d.nombre}
            {tieneAdvertenciaPoblacion(hover.d) && <IconoAdvertencia distrito={hover.d} />}
          </div>
          <div className="criminalidad-tooltip-muted">
            {hover.d.canton}, {PROVINCIA_LABEL[hover.d.provincia] ?? hover.d.provincia}
          </div>
          <div>
            {METRICA_LABEL[metrica]}: <strong>{formatoValor(hover.valor, metrica)}</strong>
          </div>
          <div className="criminalidad-tooltip-muted">Ranking #{hover.ranking}</div>
        </div>
      )}
      {typeof document !== "undefined" &&
        advertenciaTooltip &&
        createPortal(
          <div
            id="criminalidad-warning-tooltip"
            className="warning-marker-tooltip"
            role="tooltip"
            style={{ left: advertenciaTooltip.x, top: advertenciaTooltip.y }}
          >
            {advertenciaTooltip.texto}
          </div>,
          document.body
        )}
    </div>
  );
}
