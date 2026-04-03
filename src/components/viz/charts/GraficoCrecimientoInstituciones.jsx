import React, { useEffect, useRef, useState } from "react";

const DATA = [
  { año: 1900, instituciones: 39  },
  { año: 1950, instituciones: 98  },
  { año: 1960, instituciones: 118 },
  { año: 1970, instituciones: 155 },
  { año: 1980, instituciones: 220 },
  { año: 1990, instituciones: 250 },
  { año: 2000, instituciones: 325 },
  { año: 2015, instituciones: 332 },
  { año: 2024, instituciones: 332 },
];

const Y_MAX    = 360;
const Y_MIN    = 0;
const AÑO_MIN  = 1900;
const AÑO_MAX  = 2024;
const SVG_H    = 420;
const MG       = { top: 76, right: 44, bottom: 48, left: 58 };

const Y_TICKS  = [0, 50, 100, 150, 200, 250, 300, 350];
const X_TICKS  = [1900, 1920, 1940, 1960, 1980, 2000, 2024];

// ─── helpers ──────────────────────────────────────────────────────────────────

function buildPaths(data, xScale, yScale) {
  const pts = data.map((d) => [xScale(d.año), yScale(d.instituciones)]);
  const lineD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const plotBottom = SVG_H - MG.bottom;
  const areaD =
    `M${xScale(AÑO_MIN)},${plotBottom} ` +
    pts.map((p) => `L${p[0]},${p[1]}`).join(" ") +
    ` L${xScale(AÑO_MAX)},${plotBottom} Z`;
  return { lineD, areaD, pts };
}

// ─── styles ───────────────────────────────────────────────────────────────────

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
  padding: "4px 0 16px",
  border: "1px solid var(--border)",
  boxShadow: "var(--viz-shadow)",
  overflow: "hidden",
};

const txtBase = { fontFamily: "var(--font-sans)", fontVariantNumeric: "tabular-nums" };

const tooltipStyle = {
  position:       "absolute",
  background:     "var(--viz-tooltip-bg-bar)",
  border:         "1px solid var(--viz-tooltip-border)",
  borderRadius:   6,
  padding:        "6px 10px",
  boxShadow:      "var(--viz-tooltip-shadow)",
  backdropFilter: "var(--viz-tooltip-backdrop)",
  WebkitBackdropFilter: "var(--viz-tooltip-backdrop)",
  pointerEvents:  "none",
  minWidth:       120,
};

// ─── component ────────────────────────────────────────────────────────────────

export default function GraficoCrecimientoInstituciones() {
  const wrapRef   = useRef(null);
  const pathRef   = useRef(null);
  const [width,      setWidth]      = useState(680);
  const [pathLen,    setPathLen]    = useState(5000);
  const [animated,   setAnimated]   = useState(false);
  const [areaVis,    setAreaVis]    = useState(false);
  const [tooltip,    setTooltip]    = useState(null); // { x, y, año, val, side }

  // ResizeObserver
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setWidth(w);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Measure path length on each width change, then animate
  useEffect(() => {
    if (!pathRef.current) return;
    const len = pathRef.current.getTotalLength() || 5000;
    setPathLen(len);
    setAnimated(false);
    setAreaVis(false);
    const id1 = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setAnimated(true);
        // Area appears after line finishes (~1.5s)
        const id2 = setTimeout(() => setAreaVis(true), 1400);
        return () => clearTimeout(id2);
      })
    );
    return () => cancelAnimationFrame(id1);
  }, [width]);

  // Scales
  const plotW  = Math.max(width - MG.left - MG.right, 40);
  const plotH  = SVG_H - MG.top - MG.bottom;

  function xScale(año) {
    return MG.left + ((año - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * plotW;
  }
  function yScale(val) {
    return MG.top + (1 - (val - Y_MIN) / (Y_MAX - Y_MIN)) * plotH;
  }

  const { lineD, areaD, pts } = buildPaths(DATA, xScale, yScale);

  // Annotation positions
  const x1988  = xScale(1988);
  const x1990  = xScale(1990);
  const x2000  = xScale(2000);
  const x2024  = xScale(2024);
  const y2024  = yScale(332);
  const yBot   = SVG_H - MG.bottom;
  const bandMidX = (x1990 + x2000) / 2;

  function handleDotEnter(e, d) {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const px   = e.clientX - rect.left;
    const py   = e.clientY - rect.top;
    setTooltip({ x: px, y: py, año: d.año, val: d.instituciones, right: px > rect.width / 2 });
  }

  return (
    <section style={sectionStyle}>
      {/* Header */}
      <header style={{ marginBottom: 14 }}>
        <p style={{
          margin: 0, fontSize: 11, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "var(--text-muted)",
          fontWeight: 700, fontFamily: "var(--font-sans)",
        }}>
          ACTO I · TAMAÑO DEL ESTADO
        </p>
        <h3 style={{
          fontSize: "clamp(1.3rem, 2.8vw, 1.9rem)", fontWeight: 800,
          lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--text)",
          margin: "4px 0 6px", fontFamily: "var(--font-sans)",
        }}>
          De 39 a 332 instituciones: el Estado que no para de crecer
        </h3>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, fontFamily: "var(--font-sans)" }}>
          Número de instituciones públicas en Costa Rica · 1900–2024
        </p>
      </header>

      {/* Panel */}
      <div style={panelStyle} ref={wrapRef} onMouseLeave={() => setTooltip(null)}>
        <svg
          width={width}
          height={SVG_H}
          role="img"
          aria-label="Gráfico de área que muestra el crecimiento de instituciones públicas en Costa Rica de 39 en 1900 a 332 en 2024, con estancamiento desde el año 2000."
          style={{ display: "block", overflow: "visible" }}
        >
          {/* ── Horizontal grid lines ── */}
          {Y_TICKS.map((tick) => (
            <line
              key={`hg-${tick}`}
              x1={MG.left} y1={yScale(tick)}
              x2={MG.left + plotW} y2={yScale(tick)}
              stroke="var(--viz-grid)" strokeWidth={1} strokeOpacity={0.4}
            />
          ))}

          {/* ── Band 1990–2000 ── */}
          <rect
            x={x1990} y={MG.top}
            width={x2000 - x1990} height={plotH}
            fill="rgba(96,255,18,0.07)"
          />
          {/* Amber dashed top border of the band at y(250) entry level */}
          <line
            x1={x1990} y1={MG.top}
            x2={x2000} y2={MG.top}
            stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.6}
          />
          <line
            x1={x2000} y1={MG.top}
            x2={x2000} y2={yBot}
            stroke="#f59e0b" strokeWidth={0.8} strokeDasharray="3 3" strokeOpacity={0.35}
          />
          <line
            x1={x1990} y1={MG.top}
            x2={x1990} y2={yBot}
            stroke="#f59e0b" strokeWidth={0.8} strokeDasharray="3 3" strokeOpacity={0.35}
          />
          {/* Band label */}
          <text
            x={bandMidX} y={MG.top - 18}
            textAnchor="middle"
            style={{ ...txtBase, fontSize: 10, fill: "#f59e0b", fontWeight: 600 }}
          >
            84 nuevas — mayor aumento en cualquier década
          </text>
          <line
            x1={bandMidX} y1={MG.top - 12}
            x2={bandMidX} y2={MG.top - 2}
            stroke="#f59e0b" strokeWidth={1} strokeOpacity={0.5}
          />

          {/* ── COREC 1988 vertical line ── */}
          <line
            x1={x1988} y1={MG.top}
            x2={x1988} y2={yBot}
            stroke="#f59e0b" strokeWidth={1.2}
            strokeDasharray="5 4" strokeOpacity={0.75}
          />
          {/* COREC label — two lines, positioned above chart */}
          <text
            x={x1988 - 6} y={MG.top - 26}
            textAnchor="end"
            style={{ ...txtBase, fontSize: 10, fill: "#fbbf24", fontWeight: 700 }}
          >
            COREC 1988
          </text>
          <text
            x={x1988 - 6} y={MG.top - 14}
            textAnchor="end"
            style={{ ...txtBase, fontSize: 9, fill: "#9ca3af" }}
          >
            Ministerio de Reforma del Estado
          </text>

          {/* ── Area fill ── */}
          <path
            d={areaD}
            style={{
              fill:        "rgba(96,255,18,0.06)",
              fillOpacity: areaVis ? 1 : 0,
              transition:  "fill-opacity 0.9s ease",
            }}
          />

          {/* ── Main line ── */}
          <path
            ref={pathRef}
            d={lineD}
            style={{
              fill:             "none",
              stroke:           "#60ff12",
              strokeWidth:      2,
              strokeLinecap:    "round",
              strokeLinejoin:   "round",
              strokeDasharray:  pathLen,
              strokeDashoffset: animated ? 0 : pathLen,
              transition:       "stroke-dashoffset 1.5s ease-in-out",
            }}
          />

          {/* ── 2024 end-point annotation ── */}
          <circle
            cx={x2024} cy={y2024} r={5}
            style={{
              fill:        "#60ff12",
              fillOpacity: areaVis ? 1 : 0,
              filter:      "drop-shadow(0 0 6px rgba(96,255,18,0.7))",
              transition:  "fill-opacity 0.4s ease",
            }}
          />
          <text
            x={x2024 - 10} y={y2024 - 14}
            textAnchor="end"
            style={{ ...txtBase, fontSize: 10, fill: "#9ca3af" }}
          >
            Solo 15 han cerrado en 75 años
          </text>
          <line
            x1={x2024 - 8} y1={y2024 - 11}
            x2={x2024 - 2} y2={y2024 - 6}
            stroke="#6b7280" strokeWidth={0.8}
          />

          {/* ── Data point dots (hover targets) ── */}
          {DATA.map((d, i) => {
            const px = pts[i][0];
            const py = pts[i][1];
            const isEnd = d.año === 2024;
            return (
              <circle
                key={d.año}
                cx={px} cy={py}
                r={isEnd ? 0 : 5}          // end-point has its own dot above
                fill="transparent"
                stroke="transparent"
                style={{ cursor: "crosshair" }}
                onMouseEnter={(e) => handleDotEnter(e, d)}
                onMouseLeave={() => setTooltip(null)}
              >
                {/* invisible hit target */}
              </circle>
            );
          })}

          {/* ── Visible small dots on data points ── */}
          {DATA.map((d, i) => {
            const px = pts[i][0];
            const py = pts[i][1];
            if (d.año === 2024) return null; // handled separately
            return (
              <circle
                key={`vis-${d.año}`}
                cx={px} cy={py} r={3}
                style={{
                  fill:        "#0b0b0b",
                  stroke:      "#60ff12",
                  strokeWidth: 1.5,
                  fillOpacity: areaVis ? 1 : 0,
                  strokeOpacity: areaVis ? 1 : 0,
                  transition:  "fill-opacity 0.4s ease, stroke-opacity 0.4s ease",
                  pointerEvents: "none",
                }}
              />
            );
          })}

          {/* ── Hover hit areas (larger, transparent circles) ── */}
          {DATA.map((d, i) => {
            const px = pts[i][0];
            const py = pts[i][1];
            return (
              <circle
                key={`hit-${d.año}`}
                cx={px} cy={py} r={10}
                fill="transparent"
                style={{ cursor: "crosshair" }}
                onMouseEnter={(e) => handleDotEnter(e, d)}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}

          {/* ── Y-axis labels ── */}
          {Y_TICKS.map((tick) => (
            <text
              key={`yl-${tick}`}
              x={MG.left - 8} y={yScale(tick) + 4}
              textAnchor="end"
              style={{ ...txtBase, fontSize: 10, fill: "var(--text-muted)" }}
            >
              {tick}
            </text>
          ))}

          {/* ── X-axis labels ── */}
          {X_TICKS.map((año) => (
            <text
              key={`xl-${año}`}
              x={xScale(año)} y={SVG_H - MG.bottom + 18}
              textAnchor="middle"
              style={{ ...txtBase, fontSize: 10, fill: "var(--text-muted)" }}
            >
              {año}
            </text>
          ))}

          {/* ── Baseline ── */}
          <line
            x1={MG.left} y1={yBot}
            x2={MG.left + plotW} y2={yBot}
            stroke="var(--border)" strokeWidth={1}
          />
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            style={{
              ...tooltipStyle,
              left: tooltip.right ? `${tooltip.x - 140}px` : `${tooltip.x + 14}px`,
              top:  `${tooltip.y - 36}px`,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", marginBottom: 3, fontFamily: "var(--font-sans)" }}>
              {tooltip.año}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#60ff12", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>Instituciones</span>
              <strong style={{ fontSize: 11, color: "var(--text)", fontVariantNumeric: "tabular-nums", marginLeft: "auto", fontFamily: "var(--font-sans)" }}>
                {tooltip.val}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 10, fontSize: 10, textTransform: "uppercase",
        color: "var(--text-muted)", fontFamily: "var(--font-sans)",
        fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em",
      }}>
        <span>FUENTE: MIDEPLAN — Inventario de Instituciones Públicas</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
