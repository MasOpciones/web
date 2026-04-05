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

// Fixed viewBox dimensions — same pattern as InformalidadChart / GrowthGapHero
const WIDTH  = 960;
const HEIGHT = 500;
const MG     = { top: 76, right: 100, bottom: 62, left: 64 };

const PLOT_W = WIDTH  - MG.left - MG.right;  // 796
const PLOT_H = HEIGHT - MG.top  - MG.bottom; // 362

const AÑO_MIN = 1900;
const AÑO_MAX = 2024;
const Y_MIN   = 0;
const Y_MAX   = 360;

const Y_TICKS = [0, 50, 100, 150, 200, 250, 300, 350];
const X_TICKS = [1900, 1920, 1940, 1960, 1980, 2000, 2024];

// Pure scale functions — fixed viewBox, no dynamic width needed
function xScale(año) {
  return MG.left + ((año - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * PLOT_W;
}
function yScale(val) {
  return MG.top + (1 - (val - Y_MIN) / (Y_MAX - Y_MIN)) * PLOT_H;
}

function buildPaths() {
  const pts   = DATA.map((d) => [xScale(d.año), yScale(d.instituciones)]);
  const lineD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const yBot  = HEIGHT - MG.bottom;
  const areaD =
    `M${xScale(AÑO_MIN)},${yBot} ` +
    pts.map((p) => `L${p[0]},${p[1]}`).join(" ") +
    ` L${xScale(AÑO_MAX)},${yBot} Z`;
  return { lineD, areaD, pts };
}

const { lineD, areaD, pts } = buildPaths();

// Pre-computed annotation positions
const x1988    = xScale(1988);
const x1990    = xScale(1990);
const x2000    = xScale(2000);
const x2024    = xScale(2024);
const y2024    = yScale(332);
const yBot     = HEIGHT - MG.bottom;

// ─── styles ───────────────────────────────────────────────────────────────────

const sectionStyle = {
  width:      "100%",
  margin:     "2.8rem 0 3.2rem",
  padding:    "0.15rem 0",
  fontFamily: "var(--font-sans)",
  color:      "var(--text)",
};

const panelStyle = {
  position:     "relative",
  overflow:     "visible",
  width:        "100%",
  background:
    "radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 8%, transparent), transparent 36%), " +
    "linear-gradient(160deg, var(--viz-panel-strong) 0%, var(--viz-panel) 100%)",
  borderRadius: "16px",
  padding:      "20px 16px 16px",
  border:       "1px solid var(--border)",
  boxShadow:    "var(--viz-shadow)",
};

const chartTxt = {
  fontFamily:         "var(--font-sans)",
  fontVariantNumeric: "tabular-nums",
  fontSize:           11,
  fill:               "var(--text-muted)",
};

const tooltipStyle = {
  position:             "absolute",
  background:           "var(--viz-tooltip-bg)",
  border:               "1px solid var(--viz-tooltip-border)",
  borderRadius:         6,
  padding:              "10px 14px",
  boxShadow:            "var(--viz-tooltip-shadow)",
  backdropFilter:       "var(--viz-tooltip-backdrop)",
  WebkitBackdropFilter: "var(--viz-tooltip-backdrop)",
  pointerEvents:        "none",
  minWidth:             140,
};

// ─── component ────────────────────────────────────────────────────────────────

export default function GraficoCrecimientoInstituciones() {
  const svgRef  = useRef(null);
  const pathRef = useRef(null);

  const [pathLen,  setPathLen]  = useState(5000);
  const [animated, setAnimated] = useState(false);
  const [areaVis,  setAreaVis]  = useState(false);

  const [activeData, setActiveData] = useState(null);
  const [tooltipX,   setTooltipX]   = useState(0);
  const [tooltipY,   setTooltipY]   = useState(0);
  const [isRight,    setIsRight]    = useState(false);

  // Measure path length once on mount, then animate
  useEffect(() => {
    if (!pathRef.current) return;
    const len = pathRef.current.getTotalLength() || 5000;
    setPathLen(len);
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setAnimated(true);
        const t = setTimeout(() => setAreaVis(true), 1400);
        return () => clearTimeout(t);
      })
    );
    return () => cancelAnimationFrame(id);
  }, []);

  // Mouse handler — identical to InformalidadChart / GrowthGapHero
  // Uses scaleX to correct for responsive viewBox scaling
  function handleMouseMove(e) {
    if (!svgRef.current) return;
    const rect   = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const scaleX = rect.width / WIDTH;
    const chartLeft  = MG.left * scaleX;
    const chartWidth = PLOT_W * scaleX;
    const relX = mouseX - chartLeft;
    if (relX < 0 || relX > chartWidth) { setActiveData(null); return; }
    const ratio = relX / chartWidth;
    const year  = AÑO_MIN + ratio * (AÑO_MAX - AÑO_MIN);
    let closest = DATA[0], minDist = Infinity;
    for (const d of DATA) {
      const dist = Math.abs(d.año - year);
      if (dist < minDist) { minDist = dist; closest = d; }
    }
    setActiveData({ año: closest.año, val: closest.instituciones });
    setTooltipX(mouseX);
    setTooltipY(mouseY);
    setIsRight(mouseX > rect.width / 2);
  }

  return (
    <section style={sectionStyle}>
      <div style={panelStyle} onMouseLeave={() => setActiveData(null)}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          role="img"
          aria-label="Crecimiento de instituciones públicas en Costa Rica de 39 en 1900 a 332 en 2024"
          style={{ display: "block", width: "100%", height: "auto" }}
        >
          {/* Grid lines */}
          {Y_TICKS.map((tick) => (
            <line
              key={`hg-${tick}`}
              x1={MG.left} y1={yScale(tick)}
              x2={MG.left + PLOT_W} y2={yScale(tick)}
              stroke="var(--viz-grid)" strokeWidth={1} opacity={0.65}
            />
          ))}

          {/* Band 1990–2000 */}
          <rect
            x={x1990} y={MG.top}
            width={x2000 - x1990} height={PLOT_H}
            fill="var(--viz-accent)" fillOpacity={0.05}
          />
          <line x1={x1990} y1={MG.top} x2={x1990} y2={yBot}
            stroke="var(--viz-grid)" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
          <line x1={x2000} y1={MG.top} x2={x2000} y2={yBot}
            stroke="var(--viz-grid)" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />

          {/* COREC 1988 line */}
          <line x1={x1988} y1={MG.top} x2={x1988} y2={yBot}
            stroke="var(--viz-grid)" strokeWidth={1.2} strokeDasharray="5 4" strokeOpacity={0.7} />

          {/* Annotation: COREC — left of line, top of plot */}
          <text x={x1988 - 7} y={MG.top + 18} textAnchor="end"
            style={{ ...chartTxt, fill: "var(--text-muted)", fontWeight: 700, fontSize: 12 }}>
            COREC 1988
          </text>
          <text x={x1988 - 7} y={MG.top + 33} textAnchor="end"
            style={{ ...chartTxt, fontSize: 11 }}>
            Ministerio de Reforma
          </text>

          {/* Area fill */}
          <path d={areaD} style={{
            fill:        "var(--viz-accent)",
            fillOpacity: areaVis ? 0.06 : 0,
            transition:  "fill-opacity 0.9s ease",
          }} />

          {/* Main line — stroke-dashoffset draw animation */}
          <path
            ref={pathRef}
            d={lineD}
            style={{
              fill:             "none",
              stroke:           "var(--viz-accent)",
              strokeWidth:      2.5,
              strokeLinecap:    "round",
              strokeLinejoin:   "round",
              strokeDasharray:  pathLen,
              strokeDashoffset: animated ? 0 : pathLen,
              transition:       "stroke-dashoffset 1.5s ease-in-out",
            }}
          />

          {/* Data point dots */}
          {DATA.map((d, i) => {
            const [px, py] = pts[i];
            return (
              <circle key={`dot-${d.año}`}
                cx={px} cy={py} r={3}
                style={{
                  fill:          "var(--viz-panel-strong)",
                  stroke:        "var(--viz-accent)",
                  strokeWidth:   1.5,
                  fillOpacity:   areaVis ? 1 : 0,
                  strokeOpacity: areaVis ? 1 : 0,
                  transition:    "fill-opacity 0.4s ease, stroke-opacity 0.4s ease",
                  pointerEvents: "none",
                }}
              />
            );
          })}

          {/* 2024 endpoint — accent dot */}
          <circle cx={x2024} cy={y2024} r={5} style={{
            fill:        "var(--viz-accent)",
            fillOpacity: areaVis ? 1 : 0,
            filter:      "drop-shadow(0 0 6px rgba(96,255,18,0.6))",
            transition:  "fill-opacity 0.4s ease",
          }} />

          {/* End-label in right margin */}
          <text x={x2024 + 12} y={y2024 + 4} textAnchor="start"
            style={{ ...chartTxt, fill: "var(--viz-accent)", fontWeight: 700, fontSize: 11 }}>
            332 · 2024
          </text>
          <text x={x2024 + 12} y={y2024 + 17} textAnchor="start"
            style={{ ...chartTxt, fontSize: 10 }}>
            solo 15 han cerrado
          </text>

          {/* Active hover crosshair */}
          {activeData && (
            <>
              <line
                x1={xScale(activeData.año)} y1={MG.top}
                x2={xScale(activeData.año)} y2={yBot}
                stroke="var(--viz-grid)" strokeWidth={1} opacity={0.48}
              />
              <circle cx={xScale(activeData.año)} cy={yScale(activeData.val)}
                r={7} fill="var(--viz-accent)" fillOpacity={0.14} />
              <circle cx={xScale(activeData.año)} cy={yScale(activeData.val)}
                r={2.8} fill="var(--viz-accent)" />
            </>
          )}

          {/* Y axis labels */}
          {Y_TICKS.map((tick) => (
            <text key={`yl-${tick}`}
              x={MG.left - 10} y={yScale(tick) + 4}
              textAnchor="end" style={chartTxt}>
              {tick}
            </text>
          ))}

          {/* X axis labels */}
          {X_TICKS.map((año) => (
            <text key={`xl-${año}`}
              x={xScale(año)} y={HEIGHT - MG.bottom + 22}
              textAnchor="middle" style={chartTxt}>
              {año}
            </text>
          ))}

          {/* Baseline */}
          <line x1={MG.left} y1={yBot} x2={MG.left + PLOT_W} y2={yBot}
            stroke="var(--border)" strokeWidth={1} />

          {/* Mouse capture rect — last element, on top */}
          <rect
            x={MG.left} y={MG.top}
            width={PLOT_W} height={PLOT_H}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setActiveData(null)}
          />
        </svg>

        {activeData && (
          <div style={{
            ...tooltipStyle,
            left: `${tooltipX + (isRight ? -160 : 16)}px`,
            top:  `${tooltipY - 10}px`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 6,
              fontFamily: "var(--font-sans)" }}>
              {activeData.año}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%",
                background: "var(--viz-accent)", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-sans)",
                flexGrow: 1 }}>Instituciones</span>
              <strong style={{ fontSize: 12, color: "var(--text)", fontVariantNumeric: "tabular-nums",
                fontFamily: "var(--font-sans)" }}>
                {activeData.val}
              </strong>
            </div>
          </div>
        )}
      </div>

      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 12, fontSize: 10, textTransform: "uppercase",
        color: "var(--text-muted)", fontFamily: "var(--font-sans)",
        fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em",
      }}>
        <span>FUENTE: MIDEPLAN — Inventario de Instituciones Públicas</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
