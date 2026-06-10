import React, { useEffect, useRef, useState } from "react";

const DATA = [
  { año: 1990, pres: 1701,  gasto: 1366  },
  { año: 1991, pres: 1807,  gasto: 1440  },
  { año: 1992, pres: 2534,  gasto: 1909  },
  { año: 1993, pres: 3289,  gasto: 2564  },
  { año: 1994, pres: 3736,  gasto: 2966  },
  { año: 1995, pres: 4475,  gasto: 3550  },
  { año: 1996, pres: 5463,  gasto: 4509  },
  { año: 1997, pres: 7520,  gasto: 5657  },
  { año: 1998, pres: 8715,  gasto: 6180  },
  { año: 1999, pres: 11303, gasto: 8323  },
  { año: 2000, pres: 11447, gasto: 9125  },
  { año: 2001, pres: 15568, gasto: 10556 },
  { año: 2002, pres: 16643, gasto: 12448 },
  { año: 2003, pres: 16123, gasto: 12979 },
  { año: 2004, pres: 19502, gasto: 15920 },
  { año: 2005, pres: 20264, gasto: 17348 },
  { año: 2006, pres: 24970, gasto: 19984 },
  { año: 2007, pres: 34361, gasto: 23222 },
  { año: 2008, pres: 44500, gasto: 28311 },
  { año: 2009, pres: 50763, gasto: 35151 },
  { año: 2010, pres: 54557, gasto: 38298 },
  { año: 2011, pres: 54617, gasto: 42692 },
  { año: 2012, pres: 57473, gasto: 47109 },
  { año: 2013, pres: 57090, gasto: 46404 },
  { año: 2014, pres: 59163, gasto: 47110 },
];

const TXT = { fontFamily: "var(--font-sans)", fontVariantNumeric: "tabular-nums" };

const sectionStyle = {
  width: "100%",
  margin: "2.8rem 0 3.2rem",
  padding: "0.15rem 0",
  fontFamily: "var(--font-sans)",
  color: "var(--text)",
};

const panelStyle = {
  position: "relative",
  width: "100%",
  background:
    "radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 8%, transparent), transparent 36%), " +
    "linear-gradient(160deg, var(--viz-panel-strong) 0%, var(--viz-panel) 100%)",
  borderRadius: "16px",
  padding: "20px 20px 16px",
  border: "1px solid var(--border)",
  boxShadow: "var(--viz-shadow)",
  overflow: "visible",
};

const MARGIN_L = 52;
const MARGIN_R = 24;
const MARGIN_T = 20;
const MARGIN_B = 28;
const PANEL_PADDING_X = 40; // 20px left + 20px right (panelStyle.padding)

export default function GraficoPresupuestoMSJ() {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(680);
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth - PANEL_PADDING_X;
      if (w > 0) setWidth(w);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimated(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  const svgH = 240;
  const plotW = Math.max(width - MARGIN_L - MARGIN_R, 40);
  const plotH = svgH - MARGIN_T - MARGIN_B;
  const maxVal = Math.max(...DATA.map(d => d.pres));
  const minVal = 0;

  function xScale(i) {
    return MARGIN_L + (i / (DATA.length - 1)) * plotW;
  }
  function yScale(v) {
    return MARGIN_T + plotH - ((v - minVal) / (maxVal - minVal)) * plotH;
  }

  const presPath = DATA.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d.pres)}`).join(" ");
  const gastoPath = DATA.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d.gasto)}`).join(" ");
  const areaPath = [
    ...DATA.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d.pres)}`),
    ...DATA.slice().reverse().map((d, i) => `L${xScale(DATA.length - 1 - i)},${yScale(d.gasto)}`),
    "Z"
  ].join(" ");

  // Y ticks
  const yTicks = [0, 20000, 40000, 60000];

  const idx2008 = DATA.findIndex(d => d.año === 2008);
  const idx2000 = DATA.findIndex(d => d.año === 2000);

  function handleMouseMove(e) {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const svgEl = wrapRef.current.querySelector("svg");
    if (!svgEl) return;
    const svgRect = svgEl.getBoundingClientRect();
    const mx = e.clientX - svgRect.left;
    const idx = Math.round(((mx - MARGIN_L) / plotW) * (DATA.length - 1));
    const clamped = Math.max(0, Math.min(DATA.length - 1, idx));
    setHovered(clamped);
    setTipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  const fmt = (v) => v >= 1000
    ? `₡${(v / 1000).toFixed(0)},000M`
    : `₡${v}M`;

  return (
    <section style={sectionStyle}>
      <div style={panelStyle} ref={wrapRef} onMouseLeave={() => setHovered(null)} onMouseMove={handleMouseMove}>
        <svg
          width={width}
          height={svgH}
          role="img"
          aria-label="Líneas de presupuesto aprobado vs gasto real MSJ 1990-2014. El área entre ambas líneas representa el superávit libre sin ejecutar, que crece sostenidamente desde el año 2000."
          style={{ display: "block", overflow: "visible" }}
        >
          {/* Grid */}
          {yTicks.map(tick => (
            <g key={tick}>
              <line
                x1={MARGIN_L} y1={yScale(tick)}
                x2={MARGIN_L + plotW} y2={yScale(tick)}
                stroke="var(--viz-grid)" strokeWidth={1} strokeOpacity={0.2}
              />
              <text
                x={MARGIN_L - 6} y={yScale(tick) + 4}
                textAnchor="end"
                style={{ ...TXT, fill: "var(--text-muted)", fontSize: 9, opacity: 0.5 }}
              >
                {tick === 0 ? "0" : `${(tick / 1000).toFixed(0)}k M`}
              </text>
            </g>
          ))}

          {/* X axis labels */}
          {[1990, 1995, 2000, 2005, 2008, 2014].map(yr => {
            const i = DATA.findIndex(d => d.año === yr);
            if (i < 0) return null;
            return (
              <text
                key={yr}
                x={xScale(i)} y={svgH - 4}
                textAnchor="middle"
                style={{ ...TXT, fill: "var(--text-muted)", fontSize: 9, opacity: 0.5 }}
              >
                {yr}
              </text>
            );
          })}

          {/* Area between lines (superávit) */}
          <path
            d={areaPath}
            fill="var(--accent)"
            fillOpacity={animated ? 0.08 : 0}
            style={{ transition: "fill-opacity 0.8s ease" }}
          />

          {/* Reference line 2000 */}
          <line
            x1={xScale(idx2000)} y1={MARGIN_T}
            x2={xScale(idx2000)} y2={MARGIN_T + plotH}
            stroke="var(--text-muted)" strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.3}
          />
          <text
            x={xScale(idx2000) + 4} y={MARGIN_T + 10}
            style={{ ...TXT, fill: "var(--text-muted)", fontSize: 9, opacity: 0.5 }}
          >
            superávit libre inicia
          </text>

          {/* Reference line 2008 */}
          <line
            x1={xScale(idx2008)} y1={MARGIN_T}
            x2={xScale(idx2008)} y2={MARGIN_T + plotH}
            stroke="var(--accent)" strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.5}
          />
          <text
            x={xScale(idx2008) + 4} y={MARGIN_T + 10}
            style={{ ...TXT, fill: "var(--accent)", fontSize: 9, opacity: 0.7 }}
          >
            2008 — peor ejecución
          </text>

          {/* Presupuesto line */}
          <path
            d={presPath}
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            strokeOpacity={animated ? 0.45 : 0}
            style={{ transition: "stroke-opacity 0.8s ease" }}
          />

          {/* Gasto line */}
          <path
            d={gastoPath}
            fill="none"
            stroke="var(--text)"
            strokeWidth={2}
            strokeOpacity={animated ? 0.85 : 0}
            style={{ transition: "stroke-opacity 0.8s ease 0.2s" }}
          />

          {/* Hover crosshair */}
          {hovered !== null && (
            <g>
              <line
                x1={xScale(hovered)} y1={MARGIN_T}
                x2={xScale(hovered)} y2={MARGIN_T + plotH}
                stroke="var(--text-muted)" strokeWidth={1} strokeOpacity={0.25}
              />
              <circle cx={xScale(hovered)} cy={yScale(DATA[hovered].pres)} r={3.5}
                fill="var(--text-muted)" fillOpacity={0.6} />
              <circle cx={xScale(hovered)} cy={yScale(DATA[hovered].gasto)} r={3.5}
                fill="var(--text)" fillOpacity={0.9} />
            </g>
          )}
        </svg>

        {/* Tooltip */}
        {hovered !== null && (() => {
          const d = DATA[hovered];
          const superavit = d.pres - d.gasto;
          const ejec = ((d.gasto / d.pres) * 100).toFixed(1);
          const isRight = tipPos.x > (width / 2);
          return (
            <div style={{
              position: "absolute",
              left: isRight ? `${tipPos.x - 210}px` : `${tipPos.x + 14}px`,
              top: `${tipPos.y - 10}px`,
              background: "var(--viz-tooltip-bg)",
              border: "1px solid var(--viz-tooltip-border)",
              borderRadius: 8,
              padding: "10px 14px",
              boxShadow: "var(--viz-tooltip-shadow)",
              backdropFilter: "var(--viz-tooltip-backdrop)",
              WebkitBackdropFilter: "var(--viz-tooltip-backdrop)",
              pointerEvents: "none",
              minWidth: 190,
              zIndex: 10,
            }}>
              <div style={{ ...TXT, fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                {d.año}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3 }}>
                <span style={{ ...TXT, fontSize: 11, color: "var(--text-muted)" }}>Presupuesto</span>
                <strong style={{ ...TXT, fontSize: 11, color: "var(--text)" }}>{fmt(d.pres)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3 }}>
                <span style={{ ...TXT, fontSize: 11, color: "var(--text-muted)" }}>Gasto real</span>
                <strong style={{ ...TXT, fontSize: 11, color: "var(--text)" }}>{fmt(d.gasto)}</strong>
              </div>
              <div style={{ borderTop: "1px solid var(--border)", marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between", gap: 16 }}>
                <span style={{ ...TXT, fontSize: 11, color: "var(--text-muted)" }}>Ejecución</span>
                <strong style={{ ...TXT, fontSize: 11, color: ejec < 70 ? "var(--accent)" : "var(--text)" }}>{ejec}%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <span style={{ ...TXT, fontSize: 11, color: "var(--text-muted)" }}>Sin ejecutar</span>
                <strong style={{ ...TXT, fontSize: 11, color: "var(--accent)" }}>{fmt(superavit)}</strong>
              </div>
            </div>
          );
        })()}

        {/* Legend */}
        <div style={{
          display: "flex", gap: 20, marginTop: 12, paddingTop: 10,
          borderTop: "1px solid var(--border)",
          opacity: animated ? 1 : 0,
          transition: "opacity 0.5s ease 0.6s",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 20, height: 1, borderTop: "1.5px dashed var(--text-muted)", opacity: 0.5 }} />
            <span style={{ ...TXT, fontSize: 11, color: "var(--text-muted)" }}>Presupuesto aprobado</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 20, height: 2, background: "var(--text)", opacity: 0.8 }} />
            <span style={{ ...TXT, fontSize: 11, color: "var(--text-muted)" }}>Gasto real</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 20, height: 8, background: "var(--accent)", opacity: 0.12, borderRadius: 2 }} />
            <span style={{ ...TXT, fontSize: 11, color: "var(--text-muted)" }}>Superávit libre</span>
          </div>
        </div>
      </div>

      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 10, fontSize: 10, textTransform: "uppercase",
        color: "var(--text-muted)", ...TXT, letterSpacing: "0.04em",
      }}>
        <span>FUENTE: CGR / MSJ VÍA LEY 8220 — LIQUIDACIONES 1990–2014</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
