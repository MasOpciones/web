import { useEffect, useRef } from "react";

declare const d3: any;
declare const topojson: any;

// ── Theme colors ──────────────────────────────────────────────────────────────

type ThemeColors = ReturnType<typeof getThemeColors>;

function getThemeColors() {
  const isDark = !document.documentElement.classList.contains("light");
  return {
    sea:           isDark ? "#080a0c"                 : "#f0f0f0",
    land:          isDark ? "#030505"                 : "#e8e8e8",
    landHL:        isDark ? "#040707"                 : "#dedede",
    iran:          isDark ? "#050808"                 : "#d8d8d8",
    iranBorder:    isDark ? "rgba(96,255,18,0.28)"    : "rgba(80,80,80,0.3)",
    grid:          isDark ? "rgba(0,15,0,0.18)"       : "rgba(0,80,0,0.08)",
    countryStroke: isDark ? "rgba(25,40,40,0.6)"      : "rgba(180,200,180,0.6)",
    axisGreen:     (isDark ? [96,255,18]  : [60,200,10])  as [number,number,number],
    strikeRed:     (isDark ? [255,80,80]  : [200,40,40])  as [number,number,number],
    nodeIran:      isDark ? "#60ff12"                 : "#2a9a08",
    nodeActive:    isDark ? "#3ab43a"                 : "#2a8a2a",
    nodeDegraded:  isDark ? "#c8a020"                 : "#9a7010",
    nodeStroke:    isDark ? "rgba(220,100,100,0.9)"   : "rgba(180,40,40,0.9)",
    nodeStrokeRgb: isDark ? "220,100,100"             : "180,40,40",
    nodeStrikeFill:isDark ? "rgba(220,100,100,0.08)"  : "rgba(180,40,40,0.06)",
    labelStrike:   isDark ? "rgba(255,140,140,0.85)"  : "rgba(180,40,40,0.9)",
    labelCountry:  isDark ? 0.35                      : 0.55,
    legendBg:      isDark ? "#050908"                 : "#f4f4f0",
    legendBorder:  isDark ? "#0c140c"                 : "#dde0d8",
    hint:          isDark ? "rgba(96,255,18,0.22)"    : "rgba(40,140,10,0.35)",
    corners:       isDark ? "rgba(96,255,18,0.3)"     : "rgba(40,140,10,0.35)",
    sim:           isDark ? "rgba(96,255,18,0.2)"     : "rgba(40,140,10,0.3)",
  };
}

// ── Static data ───────────────────────────────────────────────────────────────

const AXIS_NODES: Record<string, { coords:[number,number]; type:string; status:string }> = {
  iran:      { coords:[51.4,35.7], type:"main",  status:"critical" },
  hezbollah: { coords:[35.5,33.9], type:"proxy", status:"active"   },
  hamas:     { coords:[34.3,31.4], type:"proxy", status:"degraded" },
  houthis:   { coords:[44.2,15.4], type:"proxy", status:"latent"   },
  pmf:       { coords:[44.4,33.3], type:"proxy", status:"active"   },
};

type ArcDef = { from:[number,number]; to:[number,number]; strength:number; speed:number };

const AXIS_ARCS: ArcDef[] = [
  { from:[51.4,35.7], to:[34.8,31.5], strength:0.9, speed:0.0018 },
  { from:[51.4,35.7], to:[50.6,26.2], strength:0.8, speed:0.002  },
  { from:[51.4,35.7], to:[54.4,24.5], strength:0.7, speed:0.0018 },
  { from:[51.4,35.7], to:[45.0,23.5], strength:0.6, speed:0.002  },
  { from:[51.4,35.7], to:[51.5,25.3], strength:0.5, speed:0.002  },
  { from:[51.4,35.7], to:[56.5,26.5], strength:0.6, speed:0.0018 },
  { from:[35.5,33.9], to:[34.8,31.5], strength:0.9, speed:0.004  },
  { from:[35.5,33.9], to:[35.2,32.8], strength:0.6, speed:0.005  },
  { from:[34.3,31.4], to:[34.8,31.8], strength:0.5, speed:0.003  },
  { from:[44.2,15.4], to:[43.0,13.5], strength:0.8, speed:0.002  },
  { from:[44.2,15.4], to:[34.8,31.5], strength:0.3, speed:0.002  },
  { from:[44.4,33.3], to:[44.0,36.2], strength:0.8, speed:0.004  },
  { from:[44.4,33.3], to:[44.4,32.5], strength:0.7, speed:0.004  },
  { from:[44.4,33.3], to:[36.5,31.0], strength:0.5, speed:0.003  },
  { from:[44.4,33.3], to:[38.5,35.0], strength:0.5, speed:0.003  },
];

const STRIKE_ARCS: ArcDef[] = [
  { from:[34.8,31.5], to:[51.4,35.7], strength:0.9, speed:0.0022 },
  { from:[34.8,31.5], to:[50.9,34.6], strength:0.7, speed:0.002  },
  { from:[34.8,31.5], to:[51.7,32.7], strength:0.7, speed:0.002  },
  { from:[34.8,31.5], to:[46.0,34.3], strength:0.6, speed:0.002  },
  { from:[34.8,31.5], to:[50.0,35.8], strength:0.6, speed:0.002  },
  { from:[34.8,31.5], to:[46.3,38.1], strength:0.5, speed:0.002  },
  { from:[34.8,31.5], to:[45.1,37.6], strength:0.4, speed:0.002  },
  { from:[34.8,31.5], to:[56.3,27.2], strength:0.7, speed:0.002  },
  { from:[34.8,31.5], to:[50.3,29.1], strength:0.6, speed:0.002  },
  { from:[34.8,31.5], to:[35.5,33.9], strength:0.9, speed:0.005  },
  { from:[34.8,31.5], to:[35.4,33.2], strength:0.9, speed:0.005  },
  { from:[50.5,26.0], to:[51.4,35.7], strength:0.8, speed:0.002  },
  { from:[50.5,26.0], to:[56.3,27.2], strength:0.7, speed:0.002  },
  { from:[34.8,31.5], to:[44.4,33.3], strength:0.6, speed:0.003  },
  { from:[50.5,26.0], to:[43.3,36.3], strength:0.6, speed:0.003  },
  { from:[34.8,31.5], to:[36.3,33.5], strength:0.5, speed:0.003  },
];

type LabelType = "accent" | "gray" | "water";
const COUNTRY_LABELS: { coords:[number,number]; label:string; type:LabelType }[] = [
  { coords:[53.7,32.4], label:"IRÁN",           type:"accent" },
  { coords:[38.5,35.0], label:"SIRIA",           type:"gray"   },
  { coords:[44.4,33.0], label:"IRAQ",            type:"gray"   },
  { coords:[36.0,34.5], label:"LÍBANO",          type:"gray"   },
  { coords:[36.8,30.5], label:"JORDANIA",        type:"gray"   },
  { coords:[29.5,27.0], label:"EGIPTO",          type:"gray"   },
  { coords:[44.5,23.5], label:"ARABIA\nSAUDITA", type:"gray"   },
  { coords:[50.5,26.3], label:"BAHRÉIN",         type:"gray"   },
  { coords:[51.2,25.3], label:"QATAR",           type:"gray"   },
  { coords:[54.5,24.2], label:"EAU",             type:"gray"   },
  { coords:[57.5,21.5], label:"OMÁN",            type:"gray"   },
  { coords:[47.5,29.5], label:"KUWAIT",          type:"gray"   },
  { coords:[44.0,15.5], label:"YEMEN",           type:"gray"   },
  { coords:[40.0,39.0], label:"TURQUÍA",         type:"gray"   },
  { coords:[43.5,13.5], label:"MAR ROJO",        type:"water"  },
  { coords:[53.0,26.5], label:"GOLFO\nPÉRSICO",  type:"water"  },
];

type NodeColorKey = keyof Pick<ThemeColors, "nodeIran"|"nodeActive"|"nodeDegraded"|"labelStrike">;
const NODE_LABELS: { coords:[number,number]; label:string; colorKey:NodeColorKey; align:CanvasTextAlign; dx:number; dy:number }[] = [
  { coords:[51.4,35.7], label:"IRÁN · IRGC",       colorKey:"nodeIran",     align:"left",  dx:14,  dy:-10 },
  { coords:[35.5,33.9], label:"HEZBOLÁ",            colorKey:"nodeActive",   align:"right", dx:-14, dy:-14 },
  { coords:[34.3,31.4], label:"HAMÁS\nGAZA",        colorKey:"nodeDegraded", align:"right", dx:-18, dy: 18 },
  { coords:[44.2,15.4], label:"HOUTHIS\nYEMEN",     colorKey:"nodeActive",   align:"left",  dx: 14, dy:  0 },
  { coords:[44.4,33.3], label:"PMF\nBAGDAD",        colorKey:"nodeActive",   align:"left",  dx: 14, dy:  0 },
  { coords:[34.8,31.5], label:"ISRAEL",             colorKey:"labelStrike",  align:"left",  dx:14,  dy:-10 },
  { coords:[50.5,26.0], label:"BASE EE.UU.\nGOLFO", colorKey:"labelStrike",  align:"left",  dx:14,  dy: -6 },
];

const HIGHLIGHT = new Set([364,422,275,887,368,760,376,682,400,792,818,414,784,512,586,31,51,268,504]);
const H = 640;
const TRAIL_LEN = 50;

// ── Component ─────────────────────────────────────────────────────────────────

export default function EjeResistenciaMap() {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const geoFeats  = useRef<any[]>([]);
  const baseProj  = useRef<any>(null);
  const W_ref     = useRef(800);
  const transform = useRef({ x:0, y:0, k:1 });
  const dragRef   = useRef<{sx:number,sy:number,tx:number,ty:number}|null>(null);

  interface Particle {
    from:[number,number]; to:[number,number];
    strength:number; speed:number;
    t:number;
    trail:number[];
    color:"green"|"red";
  }
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    function loadScript(src: string) {
      return new Promise<void>(res => {
        if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
        const s = document.createElement("script");
        s.src = src; s.onload = () => res();
        document.head.appendChild(s);
      });
    }

    async function boot() {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js");
      const wrap = wrapRef.current, canvas = canvasRef.current;
      if (!wrap || !canvas) return;
      const dpr = window.devicePixelRatio || 1;

      function resize() {
        const W = wrap!.offsetWidth;
        W_ref.current = W;
        canvas!.width  = W * dpr; canvas!.height = H * dpr;
        canvas!.style.width = W+"px"; canvas!.style.height = H+"px";
        canvas!.getContext("2d")!.scale(dpr, dpr);
        baseProj.current = d3.geoMercator()
          .center([46,29])
          .scale(W * 1.05)
          .translate([W * 0.40, H * 0.46]);
      }
      resize();

      particles.current = [
        ...AXIS_ARCS.map(a  => ({ ...a, t:Math.random(), trail:[] as number[], color:"green" as const })),
        ...STRIKE_ARCS.map(a => ({ ...a, t:Math.random(), trail:[] as number[], color:"red"   as const })),
      ];

      fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then(r => r.json()).then(w => { geoFeats.current = topojson.feature(w, w.objects.countries).features; })
        .catch(() => {});

      // Pan
      canvas.addEventListener("mousedown", e => {
        dragRef.current = { sx:e.clientX, sy:e.clientY, tx:transform.current.x, ty:transform.current.y };
        canvas.style.cursor = "grabbing";
      });
      window.addEventListener("mousemove", e => {
        if (!dragRef.current) return;
        transform.current.x = dragRef.current.tx + (e.clientX - dragRef.current.sx);
        transform.current.y = dragRef.current.ty + (e.clientY - dragRef.current.sy);
      });
      window.addEventListener("mouseup", () => { dragRef.current = null; canvas.style.cursor = "grab"; });

      // Zoom
      canvas.addEventListener("wheel", e => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        const delta = e.deltaY > 0 ? 0.96 : 1.04;
        const { x, y, k } = transform.current;
        const newK = Math.max(0.7, Math.min(4, k * delta));
        const ratio = newK / k;
        transform.current = { k:newK, x:mx-(mx-x)*ratio, y:my-(my-y)*ratio };
      }, { passive:false });

      // Touch
      let lt: Touch[] = [];
      canvas.addEventListener("touchstart", e => { lt = Array.from(e.touches); });
      canvas.addEventListener("touchmove", e => {
        e.preventDefault();
        if (e.touches.length === 1 && lt.length === 1) {
          transform.current.x += e.touches[0].clientX - lt[0].clientX;
          transform.current.y += e.touches[0].clientY - lt[0].clientY;
        } else if (e.touches.length === 2 && lt.length === 2) {
          const d0 = Math.hypot(lt[0].clientX-lt[1].clientX, lt[0].clientY-lt[1].clientY);
          const d1 = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
          transform.current.k = Math.max(0.5, Math.min(10, transform.current.k * d1 / d0));
        }
        lt = Array.from(e.touches);
      }, { passive:false });

      canvas.style.cursor = "grab";
      const ro = new ResizeObserver(resize);
      ro.observe(wrap);

      // Theme observer — render already calls getThemeColors() each frame
      const themeObserver = new MutationObserver(() => { /* no-op */ });
      themeObserver.observe(document.documentElement, { attributes:true, attributeFilter:["class"] });

      render();
      cleanup = () => { ro.disconnect(); themeObserver.disconnect(); };
    }

    // Proyectar aplicando transform
    function project(lon:number, lat:number): [number,number] {
      if (!baseProj.current) return [0,0];
      const [px,py] = baseProj.current([lon,lat]) as [number,number];
      const { x, y, k } = transform.current;
      return [px*k+x, py*k+y];
    }

    function bezierGeo(fromLon:number, fromLat:number, toLon:number, toLat:number, t:number): [number,number] {
      const f  = project(fromLon, fromLat);
      const tt = project(toLon, toLat);
      const dx = tt[0]-f[0], dy = tt[1]-f[1];
      const mid: [number,number] = [f[0]+dx*0.5-dy*0.25, f[1]+dy*0.5+dx*0.08];
      const mt = t % 1;
      return [
        (1-mt)*(1-mt)*f[0] + 2*(1-mt)*mt*mid[0] + mt*mt*tt[0],
        (1-mt)*(1-mt)*f[1] + 2*(1-mt)*mt*mid[1] + mt*mt*tt[1],
      ];
    }

    function render() {
      const canvas = canvasRef.current;
      if (!canvas) { rafRef.current = requestAnimationFrame(render); return; }
      const ctx = canvas.getContext("2d")!;
      const W   = W_ref.current;
      const { k, x, y } = transform.current;

      // Read theme every frame — reacts instantly to theme toggle
      const colors = getThemeColors();
      const [gr,gg,gb] = colors.axisGreen;
      const [rr,rg,rb] = colors.strikeRed;

      ctx.shadowBlur = 0;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = colors.sea; ctx.fillRect(0, 0, W, H);

      // Países
      if (geoFeats.current.length && baseProj.current) {
        const tProj = d3.geoMercator()
          .center([46,29])
          .scale(W_ref.current * 1.05 * k)
          .translate([W_ref.current * 0.40 * k + x, H * 0.46 * k + y]);
        const gp = d3.geoPath().projection(tProj).context(ctx);
        geoFeats.current.forEach((f:any) => {
          const id = +f.id; ctx.beginPath(); gp(f);
          if (id === 364) {
            ctx.fillStyle = colors.iran;       ctx.fill();
            ctx.strokeStyle = colors.iranBorder; ctx.lineWidth = 0.8; ctx.stroke();
          } else if (HIGHLIGHT.has(id)) {
            ctx.fillStyle = colors.landHL;        ctx.fill();
            ctx.strokeStyle = colors.countryStroke; ctx.lineWidth = 0.4; ctx.stroke();
          } else {
            ctx.fillStyle = colors.land;          ctx.fill();
            ctx.strokeStyle = colors.countryStroke; ctx.lineWidth = 0.25; ctx.stroke();
          }
        });
      }

      // Labels países secundarios
      COUNTRY_LABELS.forEach(({ coords, label, type }) => {
        const [px,py] = project(coords[0], coords[1]);
        const fs = Math.max(6, Math.min(10, 7*k*0.65));
        ctx.font = `${fs}px 'IBM Plex Mono',monospace`;
        const a = colors.labelCountry;
        if (type === "accent") {
          ctx.fillStyle = `rgba(${gr},${gg},${gb},${a})`;
        } else if (type === "water") {
          ctx.fillStyle = `rgba(${colors.nodeStrokeRgb},${a * 0.9})`;
        } else {
          ctx.fillStyle = `rgba(130,130,130,${a})`;
        }
        ctx.textAlign = "center";
        label.split("\n").forEach((l,i) => ctx.fillText(l, px, py+i*(fs+2)));
      });

      // Partículas
      particles.current.forEach(p => {
        const isGreen = p.color === "green";
        const mc = isGreen ? [gr,gg,gb] : [rr,rg,rb];

        p.trail.push(p.t % 1);
        if (p.trail.length > TRAIL_LEN) p.trail.shift();

        if (p.trail.length > 1) {
          for (let i=1; i<p.trail.length; i++) {
            const alpha = (i/p.trail.length) * 0.55 * p.strength;
            const lw    = (i/p.trail.length) * 1.4  * p.strength;
            const pa = bezierGeo(p.from[0],p.from[1],p.to[0],p.to[1],p.trail[i-1]);
            const pb = bezierGeo(p.from[0],p.from[1],p.to[0],p.to[1],p.trail[i]);
            ctx.beginPath(); ctx.moveTo(pa[0],pa[1]); ctx.lineTo(pb[0],pb[1]);
            ctx.strokeStyle = `rgba(${mc[0]},${mc[1]},${mc[2]},${alpha})`;
            ctx.lineWidth = lw; ctx.stroke();
          }
        }

        const pos = bezierGeo(p.from[0],p.from[1],p.to[0],p.to[1],p.t);
        const r = Math.max(1.5, 2.2*p.strength*Math.min(1.5, k*0.6+0.4));
        ctx.beginPath(); ctx.arc(pos[0],pos[1],r,0,Math.PI*2);
        ctx.fillStyle = `rgba(${mc[0]},${mc[1]},${mc[2]},0.95)`; ctx.fill();

        p.t += p.speed;
        if (p.t%1 < p.speed) p.trail = [];
      });

      // Nodos del eje
      const pulse = (Math.sin(Date.now()/700)+1)/2;
      Object.values(AXIS_NODES).forEach(d => {
        const [px,py] = project(d.coords[0], d.coords[1]);
        const col = d.status === "critical" ? colors.nodeIran
                  : d.status === "active"   ? colors.nodeActive
                  : d.status === "degraded" ? colors.nodeDegraded
                  :                           colors.nodeActive;
        const sz = Math.max(6, 8*Math.min(2, k*0.6+0.5));

        if (d.type === "main") {
          ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.setLineDash([]);
          ctx.strokeRect(px-sz, py-sz, sz*2, sz*2);
          ctx.strokeStyle = col+"35"; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(px,py-sz*2.4); ctx.lineTo(px,py+sz*2.4); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(px-sz*2.4,py); ctx.lineTo(px+sz*2.4,py); ctx.stroke();
          ctx.beginPath(); ctx.arc(px,py, sz*2+pulse*sz*0.8, 0, Math.PI*2);
          ctx.strokeStyle = `rgba(${gr},${gg},${gb},${0.2*pulse})`; ctx.lineWidth = 0.8; ctx.stroke();
          ctx.beginPath(); ctx.arc(px,py, 2.5, 0, Math.PI*2); ctx.fillStyle = col; ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(px,py-sz); ctx.lineTo(px+sz*0.85,py+sz*0.5); ctx.lineTo(px-sz*0.85,py+sz*0.5);
          ctx.closePath();
          ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.stroke();
          ctx.fillStyle = col+"20"; ctx.fill();
          ctx.beginPath(); ctx.arc(px,py+1, 1.5, 0, Math.PI*2); ctx.fillStyle = col; ctx.fill();
        }
      });

      // Nodos Israel + EEUU
      const pulse2 = (Math.sin(Date.now()/550)+1)/2;
      [{ lon:34.8, lat:31.5 }, { lon:50.5, lat:26.0 }].forEach(({ lon, lat }) => {
        const [px,py] = project(lon, lat);
        const sz = Math.max(7, 9*Math.min(2, k*0.6+0.5));
        ctx.strokeStyle = colors.nodeStroke; ctx.lineWidth = 1; ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(px,py-sz); ctx.lineTo(px+sz,py); ctx.lineTo(px,py+sz); ctx.lineTo(px-sz,py);
        ctx.closePath();
        ctx.stroke(); ctx.fillStyle = colors.nodeStrikeFill; ctx.fill();
        ctx.beginPath(); ctx.arc(px,py, 2, 0, Math.PI*2); ctx.fillStyle = colors.nodeStroke; ctx.fill();
        ctx.beginPath(); ctx.arc(px,py, sz*2+pulse2*sz*0.6, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(${colors.nodeStrokeRgb},${0.15*pulse2})`; ctx.lineWidth = 0.7; ctx.stroke();
      });

      // Labels nodos principales
      NODE_LABELS.forEach(({ coords, label, colorKey, align, dx, dy }) => {
        const [px,py] = project(coords[0], coords[1]);
        const fs = Math.max(8, Math.min(13, 10*Math.min(1.8, k*0.6+0.5)));
        ctx.font = `bold ${fs}px 'IBM Plex Mono',monospace`;
        ctx.fillStyle = colors[colorKey] as string; ctx.textAlign = align;
        label.split("\n").forEach((l,i) => ctx.fillText(l, px+dx, py+dy+i*(fs+2)));
      });

      rafRef.current = requestAnimationFrame(render);
    }

    boot();
    return () => {
      cancelAnimationFrame(rafRef.current);
      cleanup?.();
    };
  }, []);

  return (
    <div style={{ background:"var(--viz-panel)", borderRadius:"var(--viz-radius, 16px)", overflow:"hidden", position:"relative", marginTop:"1.2rem", border:"1px solid var(--border)", boxShadow:"var(--viz-shadow)" }}>
      {/* Hint */}
      <div style={{ position:"absolute", bottom:52, right:12, zIndex:7, pointerEvents:"none",
        fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"var(--text-muted)", opacity:0.4, letterSpacing:"0.1em" }}>
        SCROLL · ZOOM &nbsp;|&nbsp; DRAG · PAN
      </div>

      {/* Canvas */}
      <div ref={wrapRef} style={{ position:"relative", width:"100%", height:H }}>
        <canvas ref={canvasRef} style={{ display:"block", width:"100%", height:"100%" }} />
      </div>

      {/* Legend footer */}
      <div style={{
        padding: "0.75rem 1rem",
        borderTop: "1px solid var(--viz-grid)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.5rem",
        fontFamily: "var(--font-sans)",
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
      }}>
        <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--accent)", display:"inline-block" }}/>
            Eje de resistencia
          </span>
          <span style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#e05050", display:"inline-block" }}/>
            Israel / EE.UU.
          </span>
        </div>
        <span>Simulación · Marzo 2026</span>
      </div>
    </div>
  );
}
