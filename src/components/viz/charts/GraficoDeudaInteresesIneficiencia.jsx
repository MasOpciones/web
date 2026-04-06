import React, { useEffect, useRef, useState } from "react";

const BARS = [
  {
    id:      "ineficiencia",
    label:   "Ineficiencia estimada del gasto",
    value:   2300,
    color:   "var(--accent)",
    colorOp: 0.9,
    note:    "CGR: 15–20 % del presupuesto sin efecto comprobable en resultados",
  },
  {
    id:      "intereses",
    label:   "Intereses deuda pública",
    value:   2370,
    color:   "var(--text-muted)",
    colorOp: 0.55,
    note:    "Costo financiero anual del endeudamiento acumulado — MHCP 2024",
  },
  {
    id:      "infraestructura",
    label:   "Déficit infraestructura crítica",
    value:   707,
    color:   "var(--text-muted)",
    colorOp: 0.3,
    note:    "Inversión mínima pendiente en caminos, agua potable y saneamiento",
  },
];

const MAX_VAL = 2500;

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
  boxSizing: "border-box",
  background: "var(--viz-panel)",
  borderRadius: "16px",
  padding: "20px",
  border: "1px solid var(--border)",
  overflow: "hidden",
};

const tooltipStyle = {
  position: "absolute", background: "var(--viz-tooltip-bg)",
  border: "1px solid var(--viz-tooltip-border)", borderRadius: 8,
  padding: "10px 14px", boxShadow: "var(--viz-tooltip-shadow)",
  backdropFilter: "var(--viz-tooltip-backdrop)",
  WebkitBackdropFilter: "var(--viz-tooltip-backdrop)",
  pointerEvents: "none", maxWidth: 260, zIndex: 10,
};

export default function GraficoDeudaInteresesIneficiencia() {
  const panelRef   = useRef(null);
  const [animated,    setAnimated]    = useState(false);
  const [hovered,     setHovered]     = useState(null);
  const [tipPos,      setTipPos]      = useState({ x: 0, y: 0, right: false });
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimated(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  function handleMove(e, i) {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    setHovered(i);
    setTipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      right: e.clientX - rect.left > rect.width / 2,
    });
  }

  return (
    <section style={sectionStyle}>
      <div style={panelStyle} ref={panelRef} onMouseLeave={() => setHovered(null)}>

        {/* Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {BARS.map((bar, i) => {
            const pct   = (bar.value / MAX_VAL) * 100;
            const delay = `${i * 0.12}s`;

            return (
              <div
                key={bar.id}
                style={{
                  opacity:    animated ? 1 : 0,
                  transform:  animated ? "translateX(0)" : "translateX(-12px)",
                  transition: `opacity 0.45s ease ${delay}, transform 0.45s ease ${delay}`,
                  cursor:     "default",
                }}
                onMouseMove={(e) => handleMove(e, i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Label row */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "baseline",
                  marginBottom: 7, gap: 12,
                }}>
                  <span style={{
                    ...TXT, fontSize: 13, fontWeight: 600,
                    color: hovered === i ? "var(--text)" : "var(--text-muted)",
                    transition: "color 0.2s ease",
                  }}>
                    {bar.label}
                  </span>
                  <span style={{
                    ...TXT, fontSize: 14, fontWeight: 800,
                    color: bar.color === "var(--accent)" ? "var(--accent)" : "var(--text-muted)",
                    opacity: bar.colorOp,
                    whiteSpace: "nowrap",
                  }}>
                    ₡{bar.value.toLocaleString("es-CR")}B
                  </span>
                </div>

                {/* Bar track */}
                <div style={{
                  position: "relative", height: 10, borderRadius: 5,
                  background: "rgba(255,255,255,0.06)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position:   "absolute",
                    left: 0, top: 0, bottom: 0,
                    width:      animated ? `${pct}%` : "0%",
                    background: bar.color,
                    opacity:    bar.colorOp,
                    borderRadius: 5,
                    transition: `width 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}`,
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Callout cards */}
        <div style={{
          marginTop: 24, paddingTop: 16,
          borderTop: "1px solid var(--border)",
          opacity: animated ? 1 : 0,
          transition: "opacity 0.5s ease 0.5s",
          display: "flex", gap: 20, flexWrap: "wrap",
        }}>
          {[
            { key: "3x", sym: "3×", text: "Los intereses superan 3 veces la inversión en infraestructura crítica pendiente" },
            { key: "eq", sym: "≈",  text: "Ineficiencia e intereses son casi iguales — juntos consumen más del 30 % del presupuesto" },
          ].map(({ key, sym, text }) => {
            const isHov = hoveredCard === key;
            return (
              <div
                key={key}
                onMouseEnter={() => setHoveredCard(key)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  flex:       "1 1 160px",
                  padding:    "14px 16px",
                  borderRadius: 10,
                  border:     isHov ? "1px solid rgba(96,255,18,0.3)" : "1px solid var(--border)",
                  background: isHov ? "rgba(96,255,18,0.03)" : "transparent",
                  transition: "border-color 0.2s ease, background 0.2s ease",
                  cursor:     "default",
                }}
              >
                <div style={{
                  ...TXT, fontSize: 26, fontWeight: 800, lineHeight: 1,
                  color:      isHov ? "var(--accent)" : "var(--text)",
                  transition: "color 0.2s ease",
                }}>
                  {sym}
                </div>
                <div style={{ ...TXT, fontSize: 11, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.4 }}>
                  {text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tooltip */}
        {hovered !== null && (
          <div style={{
            ...tooltipStyle,
            left: tipPos.right ? `${tipPos.x - 270}px` : `${tipPos.x + 16}px`,
            top:  `${tipPos.y - 10}px`,
          }}>
            <div style={{ ...TXT, fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
              {BARS[hovered].label}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4 }}>
              <span style={{ ...TXT, fontSize: 11, color: "var(--text-muted)" }}>Monto</span>
              <strong style={{ ...TXT, fontSize: 11, color: "var(--text)" }}>
                ₡{BARS[hovered].value.toLocaleString("es-CR")} miles de millones
              </strong>
            </div>
            <div style={{ ...TXT, fontSize: 10.5, color: "var(--text-muted)", lineHeight: 1.45, marginTop: 6 }}>
              {BARS[hovered].note}
            </div>
          </div>
        )}
      </div>

      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 10, fontSize: 10, textTransform: "uppercase",
        color: "var(--text-muted)", ...TXT, letterSpacing: "0.04em",
      }}>
        <span>FUENTE: CGR — Informes de Auditoría 2022–2024 · MHCP · BID</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
