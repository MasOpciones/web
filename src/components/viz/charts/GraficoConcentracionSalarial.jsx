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
  cr:      "var(--accent)",
  ref:     "var(--accent)",
  promedio:"var(--accent)",
  ocde:    "var(--text-muted)",
  latam:   "var(--text-muted)",
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
    "radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 8%, transparent), transparent 36%), " +
    "linear-gradient(160deg, var(--viz-panel-strong) 0%, var(--viz-panel) 100%)",
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
                  strokeOpacity={0.25}
                />
                <text
                  x={tx}
                  y={svgH - MARGIN_B + 18}
                  textAnchor="middle"
                  style={{ ...textBase, fill: "var(--text-muted)", fontSize: 10, opacity: 0.5 }}
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Promedio OCDE vertical line — muted */}
          <line
            x1={avgX} y1={MARGIN_T - 6}
            x2={avgX} y2={svgH - MARGIN_B}
            stroke="var(--accent)"
            strokeWidth={1.2}
            strokeDasharray="4 3"
            strokeOpacity={0.35}
          />
          <text
            x={avgX}
            y={MARGIN_T - 10}
            textAnchor="middle"
            style={{ ...textBase, fill: "var(--accent)", fontSize: 9.5, fontWeight: 600, opacity: 0.75 }}
          >
            Prom. OCDE
          </text>

          {/* Rows */}
          {DATA.map((d, i) => {
            const y          = MARGIN_T + i * ROW_H + ROW_H / 2;
            const dotX       = xScale(d.valor);
            const stemLen    = dotX - MARGIN_L;
            const isHov      = hovered === i;
            const isCR       = d.tipo === "cr";
            const isRef      = d.tipo === "ref";
            const isAvg      = d.tipo === "promedio";
            const isOcde     = d.tipo === "ocde";
            const isLatam    = d.tipo === "latam";

            // Staggered delay
            const delay = `${i * 0.018}s`;

            // Stem styling
            const stemOpacity = isCR ? 0.4 : 0.15;
            const stemWidth   = isCR ? 1.5 : 1;

            // Dot fill opacity
            const dotFillOpacity = animated
              ? (isCR ? 1 : (isOcde || isLatam) ? 0.35 : 0.7)
              : 0;

            // Value label opacity
            const valOpacity = animated ? (isCR ? 1 : (isOcde || isLatam) ? 0.45 : 0.7) : 0;

            // Label color
            const lblColor = (isCR || isRef || isAvg) ? "var(--accent)" : "var(--text-muted)";

            return (
              <g
                key={d.pais}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "default" }}
              >
                {/* Hover row highlight */}
                {isHov && (
                  <rect
                    x={0} y={y - ROW_H / 2}
                    width={width} height={ROW_H}
                    fill="var(--text-muted)"
                    fillOpacity={0.04}
                  />
                )}

                {/* Stem — no strokeDasharray */}
                <line
                  x1={MARGIN_L} y1={y}
                  x2={dotX}     y2={y}
                  style={{
                    stroke:           DOT_COLOR[d.tipo],
                    strokeWidth:      isHov ? stemWidth + 0.5 : stemWidth,
                    strokeOpacity:    isHov ? stemOpacity * 1.8 : stemOpacity,
                    transition:       `stroke-opacity 0.15s ease, stroke-width 0.15s ease`,
                  }}
                />

                {/* Dot */}
                <circle
                  cx={dotX}
                  cy={y}
                  r={DOT_R}
                  style={{
                    fill:         DOT_COLOR[d.tipo],
                    fillOpacity:  animated ? (isHov ? Math.min(dotFillOpacity * 1.5, 1) : dotFillOpacity) : 0,
                    transition:   `fill-opacity 0.25s ease ${delay}`,
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
                    fill:       isHov && !isCR ? "var(--text)" : lblColor,
                    transition: "fill 0.15s ease",
                  }}
                >
                  {d.pais}
                </text>

                {/* Value label (after dot) — always visible */}
                <text
                  x={dotX + 7}
                  y={y + 4}
                  style={{
                    ...textBase,
                    fontSize:    isCR ? 11 : 9.5,
                    fontWeight:  isCR ? 700 : 400,
                    fill:        isHov && !isCR ? "var(--text)" : lblColor,
                    fillOpacity: animated ? (isHov ? 1 : valOpacity) : 0,
                    transition:  `fill-opacity 0.25s ease ${delay}, fill 0.15s ease`,
                  }}
                >
                  {d.valor}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Callout — plain text, no borderLeft, no background */}
        <div
          style={{
            margin:     "0 20px 4px",
            fontSize:   13,
            lineHeight: 1.55,
            color:      "var(--text-muted)",
            fontFamily: "var(--font-sans)",
          }}
        >
          De cada colón que el gobierno gasta en producir servicios públicos,{" "}
          <strong style={{ color: "var(--text)", fontWeight: 600 }}>
            71.6 céntimos van a salarios
          </strong>
          . En Noruega ese número ronda el{" "}
          <span style={{ color: "var(--text-muted)" }}>25%</span>.
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
