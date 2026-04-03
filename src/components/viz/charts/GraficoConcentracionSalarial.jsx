import React, { useEffect, useRef, useState } from "react";

const DATA = [
  { pais: "Costa Rica",   valor: 71.6, tipo: "cr"      },
  { pais: "México",       valor: 71.0, tipo: "latam"   },
  { pais: "Grecia",       valor: 62.4, tipo: "ocde"    },
  { pais: "Portugal",     valor: 58.1, tipo: "ocde"    },
  { pais: "Colombia",     valor: 56.3, tipo: "latam"   },
  { pais: "Italia",       valor: 54.8, tipo: "ocde"    },
  { pais: "España",       valor: 52.1, tipo: "ocde"    },
  { pais: "Francia",      valor: 50.3, tipo: "ocde"    },
  { pais: "Bélgica",      valor: 49.2, tipo: "ocde"    },
  { pais: "Eslovenia",    valor: 48.7, tipo: "ocde"    },
  { pais: "Austria",      valor: 47.9, tipo: "ocde"    },
  { pais: "Hungría",      valor: 46.5, tipo: "ocde"    },
  { pais: "Polonia",      valor: 45.8, tipo: "ocde"    },
  { pais: "Finlandia",    valor: 44.6, tipo: "ocde"    },
  { pais: "Rep. Checa",   valor: 44.1, tipo: "ocde"    },
  { pais: "Suecia",       valor: 43.8, tipo: "ocde"    },
  { pais: "Promedio OCDE",valor: 42.1, tipo: "promedio"},
  { pais: "Alemania",     valor: 40.2, tipo: "ocde"    },
  { pais: "Canadá",       valor: 38.9, tipo: "ocde"    },
  { pais: "Uruguay",      valor: 38.1, tipo: "latam"   },
  { pais: "EE.UU.",       valor: 37.4, tipo: "ocde"    },
  { pais: "Australia",    valor: 36.4, tipo: "ocde"    },
  { pais: "N. Zelanda",   valor: 35.2, tipo: "ocde"    },
  { pais: "Israel",       valor: 34.7, tipo: "ocde"    },
  { pais: "R. Unido",     valor: 33.8, tipo: "ocde"    },
  { pais: "Japón",        valor: 32.1, tipo: "ocde"    },
  { pais: "Irlanda",      valor: 30.2, tipo: "ocde"    },
  { pais: "Corea",        valor: 29.8, tipo: "ocde"    },
  { pais: "Países Bajos", valor: 28.5, tipo: "ocde"    },
  { pais: "Suiza",        valor: 27.4, tipo: "ocde"    },
  { pais: "Noruega",      valor: 25.3, tipo: "ref"     },
];

const X_MAX = 80;
const X_TICKS = [0, 20, 40, 60, 80];
const ROW_H = 21;
const MARGIN_L = 142;
const MARGIN_R = 52;
const MARGIN_T = 44;
const MARGIN_B = 44;
const DOT_R = 4.5;

const DOT_COLOR = {
  cr:      "#60ff12",
  ref:     "#60a5fa",
  promedio:"#f59e0b",
  ocde:    "#374151",
  latam:   "#4b5563",
};

const LABEL_COLOR = {
  cr:      "#60ff12",
  ref:     "#93c5fd",
  promedio:"#f59e0b",
  ocde:    "#6b7280",
  latam:   "#6b7280",
};

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
    "radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 8%, transparent), transparent 36%), linear-gradient(160deg, var(--viz-panel-strong) 0%, var(--viz-panel) 100%)",
  borderRadius: "16px",
  padding: "20px 0 16px",
  border: "1px solid var(--border)",
  boxShadow: "var(--viz-shadow)",
  overflow: "hidden",
};

const textBase = {
  fontFamily: "var(--font-sans)",
  fontVariantNumeric: "tabular-nums",
};

export default function GraficoConcentracionSalarial() {
  const wrapRef = useRef(null);
  const [width, setWidth]       = useState(680);
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered]   = useState(null);

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

  // Trigger enter animation
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimated(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  const plotW   = Math.max(width - MARGIN_L - MARGIN_R, 40);
  const svgH    = MARGIN_T + DATA.length * ROW_H + MARGIN_B;

  function xScale(val) {
    return MARGIN_L + (val / X_MAX) * plotW;
  }

  const avgEntry = DATA.find((d) => d.tipo === "promedio");
  const avgX     = avgEntry ? xScale(avgEntry.valor) : 0;

  return (
    <section style={sectionStyle}>
      {/* Header */}
      <header style={{ marginBottom: 14 }}>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            fontWeight: 700,
            fontFamily: "var(--font-sans)",
          }}
        >
          ACTO IV · ESTRUCTURA DEL GASTO PÚBLICO
        </p>
        <h3
          style={{
            fontSize: "clamp(1.3rem, 2.8vw, 1.9rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            margin: "4px 0 6px",
            fontFamily: "var(--font-sans)",
          }}
        >
          Los salarios se llevan más de 7 de cada 10 colones del gasto de gobierno
        </h3>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, fontFamily: "var(--font-sans)" }}>
          Remuneraciones como % de los costos de producción del gobierno · países OCDE y seleccionados
        </p>
      </header>

      {/* Panel */}
      <div style={panelStyle} ref={wrapRef}>
        <svg
          width={width}
          height={svgH}
          role="img"
          aria-label="Dot plot comparativo de remuneraciones como porcentaje de costos de producción del gobierno, países OCDE. Costa Rica 71.6% encabeza la lista; Noruega 25.3% está al final."
          style={{ display: "block", overflow: "visible" }}
        >
          {/* Grid lines + X-axis labels */}
          {X_TICKS.map((tick) => {
            const tx = xScale(tick);
            return (
              <g key={`tick-${tick}`}>
                <line
                  x1={tx} y1={MARGIN_T - 6}
                  x2={tx} y2={svgH - MARGIN_B}
                  stroke="var(--viz-grid)"
                  strokeWidth={1}
                  strokeOpacity={0.45}
                />
                <text
                  x={tx}
                  y={svgH - MARGIN_B + 18}
                  textAnchor="middle"
                  style={{ ...textBase, fill: "var(--text-muted)", fontSize: 10 }}
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Promedio OCDE vertical dashed line */}
          <line
            x1={avgX} y1={MARGIN_T - 6}
            x2={avgX} y2={svgH - MARGIN_B}
            stroke="#f59e0b"
            strokeWidth={1.2}
            strokeDasharray="4 3"
            strokeOpacity={0.8}
          />
          <text
            x={avgX}
            y={MARGIN_T - 10}
            textAnchor="middle"
            style={{ ...textBase, fill: "#f59e0b", fontSize: 9.5, fontWeight: 600 }}
          >
            Prom. OCDE
          </text>

          {/* Rows */}
          {DATA.map((d, i) => {
            const y          = MARGIN_T + i * ROW_H + ROW_H / 2;
            const dotX       = xScale(d.valor);
            const stemLen    = dotX - MARGIN_L;
            const isHov      = hovered === i;
            const dotColor   = DOT_COLOR[d.tipo]  ?? "#374151";
            const lblColor   = LABEL_COLOR[d.tipo] ?? "#6b7280";
            const isCR       = d.tipo === "cr";
            const isRef      = d.tipo === "ref";
            const isAvg      = d.tipo === "promedio";

            // Staggered delay
            const delay = `${i * 0.018}s`;

            return (
              <g
                key={d.pais}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "default" }}
              >
                {/* CR row background */}
                {isCR && (
                  <rect
                    x={0} y={y - ROW_H / 2}
                    width={width} height={ROW_H}
                    fill="#60ff12"
                    fillOpacity={0.055}
                  />
                )}

                {/* Hover row highlight */}
                {isHov && !isCR && (
                  <rect
                    x={0} y={y - ROW_H / 2}
                    width={width} height={ROW_H}
                    fill="#ffffff"
                    fillOpacity={0.03}
                  />
                )}

                {/* Stem */}
                <line
                  x1={MARGIN_L} y1={y}
                  x2={dotX}     y2={y}
                  style={{
                    stroke:              dotColor,
                    strokeWidth:         isCR ? (isHov ? 2.4 : 1.8) : (isHov ? 1.8 : 1.1),
                    strokeOpacity:       isCR ? 0.55 : isRef ? 0.45 : isAvg ? 0.6 : 0.3,
                    strokeDasharray:     stemLen > 0 ? stemLen : 1,
                    strokeDashoffset:    animated ? 0 : (stemLen > 0 ? stemLen : 1),
                    transition:          `stroke-dashoffset 0.65s ease ${delay}`,
                  }}
                />

                {/* Dot */}
                <circle
                  cx={dotX}
                  cy={y}
                  r={isHov ? DOT_R + 1 : DOT_R}
                  style={{
                    fill:            dotColor,
                    fillOpacity:     animated ? 1 : 0,
                    filter:          isCR
                      ? "drop-shadow(0 0 5px rgba(96,255,18,0.65))"
                      : isRef
                      ? "drop-shadow(0 0 3px rgba(96,165,250,0.45))"
                      : isHov
                      ? "brightness(1.4)"
                      : "none",
                    transition:      `fill-opacity 0.25s ease ${delay}, r 0.15s ease, filter 0.15s ease`,
                  }}
                />

                {/* Country label */}
                <text
                  x={MARGIN_L - 8}
                  y={y + 4}
                  textAnchor="end"
                  style={{
                    ...textBase,
                    fontSize:   isCR ? 12 : isRef || isAvg ? 11 : 10.5,
                    fontWeight: isCR ? 700 : isRef || isAvg ? 600 : 400,
                    fill:       isHov
                      ? (isCR || isRef || isAvg ? lblColor : "#9ca3af")
                      : lblColor,
                    transition: "fill 0.15s ease",
                  }}
                >
                  {d.pais}
                </text>

                {/* Value label (after dot) */}
                <text
                  x={dotX + 7}
                  y={y + 4}
                  style={{
                    ...textBase,
                    fontSize:    isCR ? 11 : 9.5,
                    fontWeight:  isCR ? 700 : 400,
                    fill:        lblColor,
                    fillOpacity: animated ? (isHov || isCR || isRef || isAvg ? 1 : 0.55) : 0,
                    transition:  `fill-opacity 0.25s ease ${delay}`,
                  }}
                >
                  {d.valor}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Callout */}
        <div
          style={{
            margin:      "0 16px 4px",
            padding:     "10px 14px",
            borderLeft:  "3px solid #60ff12",
            background:  "rgba(96,255,18,0.05)",
            borderRadius: "0 8px 8px 0",
            fontSize:    13,
            lineHeight:  1.55,
            color:       "var(--text-muted)",
            fontFamily:  "var(--font-sans)",
          }}
        >
          De cada colón que el gobierno gasta en producir servicios públicos,{" "}
          <strong style={{ color: "#60ff12", fontWeight: 700 }}>
            71.6 céntimos van a salarios
          </strong>
          . En Noruega ese número ronda el{" "}
          <span style={{ color: "#93c5fd" }}>25%</span>.
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          display:         "flex",
          justifyContent:  "space-between",
          alignItems:      "center",
          gap:             12,
          marginTop:       10,
          fontSize:        10,
          textTransform:   "uppercase",
          color:           "var(--text-muted)",
          fontFamily:      "var(--font-sans)",
          fontVariantNumeric: "tabular-nums",
          letterSpacing:   "0.04em",
        }}
      >
        <span>FUENTE: OCDE — Government at a Glance 2023</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
