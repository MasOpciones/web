import React, { useEffect, useRef, useState } from "react";

const DATA = [
  { pais: "Costa Rica",   valor: 135.5, tipo: "cr"      },
  { pais: "El Salvador",  valor: 107.0, tipo: "ca"      },
  { pais: "Nicaragua",    valor: 87.9,  tipo: "ca"      },
  { pais: "Guatemala",    valor: 86.0,  tipo: "ca"      },
  { pais: "Promedio CA",  valor: 84.0,  tipo: "promedio"},
  { pais: "Panamá",       valor: 54.8,  tipo: "ca"      },
  { pais: "Honduras",     valor: 44.5,  tipo: "ca"      },
];

const X_MAX = 160;
const X_TICKS = [0, 40, 80, 120, 160];
const ROW_H = 28;
const MARGIN_L = 130;
const MARGIN_R = 64;
const MARGIN_T = 32;
const MARGIN_B = 28;
const DOT_R = 5;

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
  padding: "20px 0 16px",
  border: "1px solid var(--border)",
  boxShadow: "var(--viz-shadow)",
  overflow: "visible",
};

export default function GraficoGastoMunicipal() {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(680);
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
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

  const plotW = Math.max(width - MARGIN_L - MARGIN_R, 40);
  const svgH = MARGIN_T + DATA.length * ROW_H + MARGIN_B;

  function xScale(val) {
    return MARGIN_L + (val / X_MAX) * plotW;
  }

  const avgEntry = DATA.find(d => d.tipo === "promedio");
  const avgX = avgEntry ? xScale(avgEntry.valor) : 0;

  return (
    <section style={sectionStyle}>
      <div style={panelStyle} ref={wrapRef}>
        <svg
          width={width}
          height={svgH}
          role="img"
          aria-label="Dot plot de gasto municipal per cápita en dólares en Centroamérica. Costa Rica lidera con $135.5, casi el doble del promedio regional de $84."
          style={{ display: "block", overflow: "visible" }}
        >
          {/* Grid ticks */}
          {X_TICKS.map(tick => {
            const tx = xScale(tick);
            return (
              <g key={tick}>
                <line
                  x1={tx} y1={MARGIN_T - 8}
                  x2={tx} y2={svgH - MARGIN_B}
                  stroke="var(--viz-grid)" strokeWidth={1} strokeOpacity={0.2}
                />
                <text
                  x={tx} y={svgH - MARGIN_B + 16}
                  textAnchor="middle"
                  style={{ ...TXT, fill: "var(--text-muted)", fontSize: 9, opacity: 0.45 }}
                >
                  ${tick}
                </text>
              </g>
            );
          })}

          {/* Promedio reference line */}
          <line
            x1={avgX} y1={MARGIN_T - 8}
            x2={avgX} y2={svgH - MARGIN_B}
            stroke="var(--text-muted)"
            strokeWidth={1.2}
            strokeDasharray="4 3"
            strokeOpacity={0.4}
          />
          <text
            x={avgX} y={MARGIN_T - 12}
            textAnchor="middle"
            style={{ ...TXT, fill: "var(--text-muted)", fontSize: 9, fontWeight: 600, opacity: 0.6 }}
          >
            Promedio CA
          </text>

          {/* Rows */}
          {DATA.map((d, i) => {
            const y = MARGIN_T + i * ROW_H + ROW_H / 2;
            const dotX = xScale(d.valor);
            const isCR = d.tipo === "cr";
            const isAvg = d.tipo === "promedio";
            const isHov = hovered === i;
            const delay = `${i * 0.06}s`;
            const stemOpacity = isCR ? 0.5 : 0.18;
            const dotOpacity = isCR ? 1 : isAvg ? 0.6 : 0.35;
            const lblColor = isCR ? "var(--accent)" : isAvg ? "var(--accent)" : "var(--text-muted)";

            return (
              <g
                key={d.pais}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "default" }}
              >
                {isHov && (
                  <rect
                    x={0} y={y - ROW_H / 2}
                    width={width} height={ROW_H}
                    fill="var(--text-muted)"
                    fillOpacity={0.04}
                  />
                )}

                {/* Stem */}
                <line
                  x1={MARGIN_L} y1={y}
                  x2={dotX} y2={y}
                  style={{
                    stroke: isCR ? "var(--accent)" : "var(--text-muted)",
                    strokeWidth: isCR ? 2 : 1,
                    strokeOpacity: isHov ? stemOpacity * 2 : stemOpacity,
                    transition: `stroke-opacity 0.15s ease`,
                  }}
                />

                {/* Dot */}
                <circle
                  cx={dotX} cy={y} r={DOT_R}
                  style={{
                    fill: isCR ? "var(--accent)" : isAvg ? "var(--accent)" : "var(--text-muted)",
                    fillOpacity: animated
                      ? (isHov ? Math.min(dotOpacity * 1.5, 1) : dotOpacity)
                      : 0,
                    transition: `fill-opacity 0.35s ease ${delay}`,
                  }}
                />

                {/* Label */}
                <text
                  x={MARGIN_L - 8} y={y + 4}
                  textAnchor="end"
                  style={{
                    ...TXT,
                    fontSize: isCR ? 12 : 11,
                    fontWeight: isCR ? 700 : isAvg ? 600 : 400,
                    fill: isHov ? "var(--text)" : lblColor,
                    transition: "fill 0.15s ease",
                  }}
                >
                  {d.pais}
                </text>

                {/* Value */}
                <text
                  x={dotX + 9} y={y + 4}
                  style={{
                    ...TXT,
                    fontSize: isCR ? 12 : 10,
                    fontWeight: isCR ? 700 : 400,
                    fill: isHov ? "var(--text)" : lblColor,
                    fillOpacity: animated ? (isHov ? 1 : isCR ? 1 : isAvg ? 0.7 : 0.45) : 0,
                    transition: `fill-opacity 0.35s ease ${delay}, fill 0.15s ease`,
                  }}
                >
                  ${d.valor}
                </text>
              </g>
            );
          })}
        </svg>

        <div style={{
          margin: "0 20px 4px",
          fontSize: 13,
          lineHeight: 1.55,
          color: "var(--text-muted)",
          fontFamily: "var(--font-sans)",
          opacity: animated ? 1 : 0,
          transition: "opacity 0.5s ease 0.5s",
        }}>
          Costa Rica tiene el gasto municipal per cápita{" "}
          <strong style={{ color: "var(--text)", fontWeight: 600 }}>más alto de Centroamérica</strong>
          {" "}— y la mayor proporción de recursos propios. El argumento de que falta presupuesto no aguanta la comparación regional.
        </div>
      </div>

      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 10, fontSize: 10, textTransform: "uppercase",
        color: "var(--text-muted)", ...TXT, letterSpacing: "0.04em",
      }}>
        <span>FUENTE: BID — IDB-DP-552 "Panorama de las finanzas municipales en América Central" (2017)</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
