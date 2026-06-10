import React, { useEffect, useRef, useState } from "react";

const DATA = [
  { año: 2008, canton: 8726, carmen: 426, merced: 371, hospital: 1891, catedral: 553 },
  { año: 2010, canton: 8181, carmen: 407, merced: 336, hospital: 1800, catedral: 430 },
  { año: 2012, canton: 7828, carmen: 493, merced: 450, hospital: 1463, catedral: 618 },
  { año: 2016, canton: 5962, carmen: 457, merced: 557, hospital: 1030, catedral: 531 },
  { año: 2018, canton: 5492, carmen: 438, merced: 537, hospital: 924,  catedral: 558 },
  { año: 2022, canton: 4571, carmen: 386, merced: 458, hospital: 724,  catedral: 488 },
  { año: 2023, canton: 4597, carmen: 396, merced: 490, hospital: 727,  catedral: 518 },
  { año: 2024, canton: 4822, carmen: 418, merced: 562, hospital: 741,  catedral: 544 },
];

const LINES = [
  { key: "canton",   label: "Total cantón",  color: "var(--text)",       width: 2.5, opacity: 0.9,  labelOpacity: 0.9  },
  { key: "hospital", label: "Hospital",       color: "var(--viz-line-accent)",     width: 1.5, opacity: 0.85, labelOpacity: 0.85 },
  { key: "merced",   label: "Merced",         color: "var(--viz-line-muted)", width: 1.5, opacity: 0.65, labelOpacity: 0.7  },
  { key: "catedral", label: "Catedral",       color: "var(--viz-line-muted)", width: 1.5, opacity: 0.5,  labelOpacity: 0.6  },
  { key: "carmen",   label: "Carmen",         color: "var(--viz-line-muted)", width: 1.5, opacity: 0.4,  labelOpacity: 0.55 },
];

const TXT = { fontFamily: "var(--font-sans)", fontVariantNumeric: "tabular-nums" };
const MARGIN_L = 48;
const MARGIN_R = 20;
const MARGIN_T = 16;
const MARGIN_B = 24;

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
    "radial-gradient(circle at top left, color-mix(in srgb, var(--viz-line-accent) 8%, transparent), transparent 36%), " +
    "linear-gradient(160deg, var(--viz-panel-strong) 0%, var(--viz-panel) 100%)",
  borderRadius: "16px",
  padding: "20px 20px 16px",
  border: "1px solid var(--border)",
  boxShadow: "var(--viz-shadow)",
  overflow: "visible",
};

const PANEL_PADDING_X = 40; // 20px left + 20px right (panelStyle.padding)

export default function GraficoDEEDistritos() {
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
  const maxVal = 9500;

  function xScale(i) {
    return MARGIN_L + (i / (DATA.length - 1)) * plotW;
  }
  function yScale(v) {
    return MARGIN_T + plotH - (v / maxVal) * plotH;
  }

  const yTicks = [0, 2000, 4000, 6000, 8000];
  const idx2022 = DATA.findIndex(d => d.año === 2022);

  function handleMouseMove(e) {
    if (!wrapRef.current) return;
    const svgEl = wrapRef.current.querySelector("svg");
    if (!svgEl) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const svgRect = svgEl.getBoundingClientRect();
    const mx = e.clientX - svgRect.left;
    const idx = Math.round(((mx - MARGIN_L) / plotW) * (DATA.length - 1));
    const clamped = Math.max(0, Math.min(DATA.length - 1, idx));
    setHovered(clamped);
    setTipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <section style={sectionStyle}>
      <div style={panelStyle} ref={wrapRef} onMouseLeave={() => setHovered(null)} onMouseMove={handleMouseMove}>

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ ...TXT, fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, lineHeight: 1.3 }}>
            Empresas formales registradas en el cantón central de San José
          </p>
          <p style={{ ...TXT, fontSize: 11, color: "var(--viz-line-muted)", margin: "4px 0 0", lineHeight: 1.4 }}>
            El cantón perdió el{" "}
            <strong style={{ color: "var(--viz-line-accent)" }}>47.6%</strong>
            {" "}de sus empresas entre 2008 y 2022. Hospital cayó un{" "}
            <strong style={{ color: "var(--viz-line-accent)" }}>61.7%</strong>.
          </p>
        </div>

        <svg
          width={width}
          height={svgH}
          role="img"
          aria-label="Líneas de empresas formales por distrito central de San José 2008-2024."
          style={{ display: "block", overflow: "visible" }}
        >
          {/* Grid */}
          {yTicks.map(tick => (
            <g key={tick}>
              <line
                x1={MARGIN_L} y1={yScale(tick)}
                x2={MARGIN_L + plotW} y2={yScale(tick)}
                stroke="var(--viz-line-grid)" strokeWidth={1} strokeOpacity={0.2}
              />
              <text
                x={MARGIN_L - 6} y={yScale(tick) + 4}
                textAnchor="end"
                style={{ ...TXT, fill: "var(--viz-line-muted)", fontSize: 9, opacity: 0.5 }}
              >
                {tick === 0 ? "0" : `${(tick/1000).toFixed(0)}k`}
              </text>
            </g>
          ))}

          {/* X axis */}
          {DATA.map((d, i) => (
            <text
              key={d.año}
              x={xScale(i)} y={svgH - 4}
              textAnchor="middle"
              style={{ ...TXT, fill: "var(--viz-line-muted)", fontSize: 9, opacity: 0.45 }}
            >
              {d.año}
            </text>
          ))}

          {/* Reference line 2022 */}
          <line
            x1={xScale(idx2022)} y1={MARGIN_T}
            x2={xScale(idx2022)} y2={MARGIN_T + plotH}
            stroke="var(--viz-line-accent)" strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.5}
          />
          <text
            x={xScale(idx2022) - 4} y={MARGIN_T + 12}
            textAnchor="end"
            style={{ ...TXT, fill: "var(--viz-line-accent)", fontSize: 9, opacity: 0.8 }}
          >
            mínimo histórico
          </text>

          {/* Lines */}
          {LINES.map((line, li) => {
            const path = DATA.map((d, i) =>
              `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d[line.key])}`
            ).join(" ");
            const delay = `${li * 0.1}s`;
            return (
              <path
                key={line.key}
                d={path}
                fill="none"
                stroke={line.color}
                strokeWidth={line.width}
                strokeOpacity={animated ? line.opacity : 0}
                style={{ transition: `stroke-opacity 0.7s ease ${delay}` }}
              />
            );
          })}

          {/* Hover dots */}
          {hovered !== null && LINES.map(line => (
            <circle
              key={line.key}
              cx={xScale(hovered)}
              cy={yScale(DATA[hovered][line.key])}
              r={line.key === "canton" ? 4 : 3}
              fill={line.color}
              fillOpacity={line.labelOpacity}
            />
          ))}
        </svg>

        {/* Tooltip */}
        {hovered !== null && (() => {
          const d = DATA[hovered];
          const isRight = tipPos.x > (width * 0.6);
          return (
            <div style={{
              position: "absolute",
              left: isRight ? `${tipPos.x - 200}px` : `${tipPos.x + 14}px`,
              top: `${tipPos.y - 10}px`,
              background: "var(--viz-tooltip-bg)",
              border: "1px solid var(--viz-tooltip-border)",
              borderRadius: 8,
              padding: "10px 14px",
              boxShadow: "var(--viz-tooltip-shadow)",
              backdropFilter: "var(--viz-tooltip-backdrop)",
              WebkitBackdropFilter: "var(--viz-tooltip-backdrop)",
              pointerEvents: "none",
              minWidth: 175,
              zIndex: 10,
            }}>
              <div style={{ ...TXT, fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                {d.año}
              </div>
              {LINES.map(line => (
                <div key={line.key} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 2 }}>
                  <span style={{ ...TXT, fontSize: 11, color: line.color, opacity: line.labelOpacity }}>{line.label}</span>
                  <strong style={{ ...TXT, fontSize: 11, color: "var(--text)" }}>
                    {d[line.key].toLocaleString("es-CR")}
                  </strong>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Legend */}
        <div style={{
          display: "flex", gap: 16, flexWrap: "wrap",
          marginTop: 12, paddingTop: 10,
          borderTop: "1px solid var(--border)",
          opacity: animated ? 1 : 0,
          transition: "opacity 0.5s ease 0.6s",
        }}>
          {LINES.map(line => (
            <div key={line.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 16,
                height: line.key === "canton" ? 2.5 : 1.5,
                background: line.color,
                opacity: line.labelOpacity,
              }} />
              <span style={{ ...TXT, fontSize: 11, color: line.color, opacity: line.labelOpacity }}>{line.label}</span>
            </div>
          ))}
        </div>
      </div>

      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 10, fontSize: 10, textTransform: "uppercase",
        color: "var(--viz-line-muted)", ...TXT, letterSpacing: "0.04em",
      }}>
        <span>FUENTE: INEC — DIRECTORIO DE EMPRESAS Y ESTABLECIMIENTOS 2008–2024</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
