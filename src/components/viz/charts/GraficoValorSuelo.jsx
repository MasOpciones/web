import React, { useEffect, useRef, useState } from "react";

const ZONAS = [
  { nombre: "Boulevard / Av. Central", v2008: 900,  v2021: 1300, real: -26  },
  { nombre: "Barrio Amón",             v2008: 700,  v2021: 370,  real: -73  },
  { nombre: "Plaza Democracia",        v2008: 800,  v2021: 800,  real: -49  },
  { nombre: "Terminal Atlántico",      v2008: 700,  v2021: 1000, real: -27  },
  { nombre: "Mercado Borbón / Coca Cola", v2008: 125, v2021: 59, real: -76 },
  { nombre: "Paseo Colón",             v2008: 425,  v2021: 650,  real: -22  },
];

const MAX_VAL = 1400;

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
  background: "var(--viz-panel-deep)",
  borderRadius: "16px",
  padding: "20px",
  border: "1px solid var(--border)",
  boxShadow: "var(--viz-shadow)",
};

const tooltipStyle = {
  position: "absolute",
  background: "var(--viz-tooltip-bg)",
  border: "1px solid var(--viz-tooltip-border)",
  borderRadius: 8,
  padding: "10px 14px",
  boxShadow: "var(--viz-tooltip-shadow)",
  backdropFilter: "var(--viz-tooltip-backdrop)",
  WebkitBackdropFilter: "var(--viz-tooltip-backdrop)",
  pointerEvents: "none",
  minWidth: 200,
  zIndex: 10,
};

export default function GraficoValorSuelo() {
  const panelRef = useRef(null);
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0, right: false });

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
      right: e.clientX - rect.left > rect.width * 0.55,
    });
  }

  return (
    <section style={sectionStyle}>
      <div style={panelStyle} ref={panelRef} onMouseLeave={() => setHovered(null)}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ ...TXT, fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, lineHeight: 1.3 }}>
            Valor fiscal del suelo — distritos centrales de San José
          </p>
          <p style={{ ...TXT, fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0" }}>
            ₡/m² nominal · Cambio real ajustado por inflación ~95% (2008→2021)
          </p>
        </div>

        {/* Column headers */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 80px 80px 72px",
          gap: "0 12px",
          padding: "0 0 8px",
          borderBottom: "1px solid var(--border)",
          opacity: animated ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}>
          <span style={{ ...TXT, fontSize: 10, color: "var(--text-muted)", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.05em" }}>Zona</span>
          <span style={{ ...TXT, fontSize: 10, color: "var(--text-muted)", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>2008</span>
          <span style={{ ...TXT, fontSize: 10, color: "var(--text-muted)", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>2021</span>
          <span style={{ ...TXT, fontSize: 10, color: "var(--text-muted)", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Δ real</span>
        </div>

        {/* Rows */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {ZONAS.map((z, i) => {
            const isHov = hovered === i;
            const isLast = i === ZONAS.length - 1;
            const delay = `${i * 0.08}s`;
            const isWorst = z.real <= -70;
            const pct2008 = (z.v2008 / MAX_VAL) * 100;
            const pct2021 = (z.v2021 / MAX_VAL) * 100;

            return (
              <div
                key={z.nombre}
                style={{
                  padding: "16px 0",
                  borderBottom: isLast ? "none" : "1px solid color-mix(in srgb, var(--border) 30%, transparent)",
                  opacity: animated ? 1 : 0,
                  transform: animated ? "translateX(0)" : "translateX(-8px)",
                  transition: `opacity 0.4s ease ${delay}, transform 0.4s ease ${delay}, background 0.15s ease`,
                  cursor: "default",
                  borderRadius: 6,
                  background: isHov ? "rgba(255,255,255,0.02)" : "transparent",
                }}
                onMouseMove={e => handleMove(e, i)}
                onMouseLeave={() => setHovered(null)}
              >
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 80px 80px 72px",
                  gap: "0 12px",
                  alignItems: "center",
                  marginBottom: 8,
                }}>
                  <span style={{
                    ...TXT, fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text)",
                    lineHeight: 1.3,
                  }}>
                    {z.nombre}
                  </span>
                  <span style={{ ...TXT, fontSize: 12, color: "var(--text-muted)", textAlign: "right" }}>
                    {z.v2008.toLocaleString("es-CR")}k
                  </span>
                  <span style={{ ...TXT, fontSize: 12, color: "var(--text)", textAlign: "right", fontWeight: 500 }}>
                    {z.v2021.toLocaleString("es-CR")}k
                  </span>
                  <span style={{
                    ...TXT, fontSize: 12,
                    fontWeight: isWorst ? 700 : 400,
                    color: isWorst ? "var(--accent)" : "var(--text-muted)",
                    textAlign: "right",
                  }}>
                    {z.real}%
                  </span>
                </div>

                {/* Bars */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {/* 2008 bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ ...TXT, fontSize: 10, fontWeight: 500, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", width: 32, flexShrink: 0 }}>2008</span>
                    <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        width: animated ? `${pct2008}%` : "0%",
                        height: "100%",
                        background: "var(--border)",
                        opacity: 0.5,
                        borderRadius: 3,
                        transition: `width 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}`,
                      }} />
                    </div>
                  </div>
                  {/* 2021 bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ ...TXT, fontSize: 10, fontWeight: 500, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", width: 32, flexShrink: 0 }}>2021</span>
                    <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        width: animated ? `${pct2021}%` : "0%",
                        height: "100%",
                        background: isWorst ? "var(--accent)" : "var(--text)",
                        opacity: isWorst ? 1 : 0.85,
                        borderRadius: 3,
                        transition: `width 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}`,
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 12, paddingTop: 10,
          borderTop: "1px solid var(--border)",
          opacity: animated ? 1 : 0,
          transition: "opacity 0.5s ease 0.55s",
        }}>
          <p style={{ ...TXT, fontSize: 11, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
            Valores fiscales ONT-Hacienda en miles de ₡/m² nominales. El cambio real ajusta por inflación acumulada ~95% (BCCR). Las zonas en verde perdieron más del 70% de su valor en términos reales.
          </p>
        </div>

        {/* Tooltip */}
        {hovered !== null && (
          <div style={{
            ...tooltipStyle,
            left: tipPos.right ? `${tipPos.x - 220}px` : `${tipPos.x + 14}px`,
            top: `${tipPos.y - 10}px`,
          }}>
            <div style={{ ...TXT, fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
              {ZONAS[hovered].nombre}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3 }}>
              <span style={{ ...TXT, fontSize: 11, color: "var(--text-muted)" }}>2008</span>
              <strong style={{ ...TXT, fontSize: 11, color: "var(--text)" }}>₡{ZONAS[hovered].v2008.toLocaleString("es-CR")},000/m²</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3 }}>
              <span style={{ ...TXT, fontSize: 11, color: "var(--text-muted)" }}>2021</span>
              <strong style={{ ...TXT, fontSize: 11, color: "var(--text)" }}>₡{ZONAS[hovered].v2021.toLocaleString("es-CR")},000/m²</strong>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between", gap: 16 }}>
              <span style={{ ...TXT, fontSize: 11, color: "var(--text-muted)" }}>Cambio real</span>
              <strong style={{ ...TXT, fontSize: 11, color: ZONAS[hovered].real <= -70 ? "var(--accent)" : "var(--text)" }}>
                {ZONAS[hovered].real}%
              </strong>
            </div>
          </div>
        )}
      </div>

      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 10, fontSize: 10, textTransform: "uppercase",
        color: "var(--text-muted)", ...TXT, letterSpacing: "0.04em",
      }}>
        <span>FUENTE: ONT / MINISTERIO DE HACIENDA — PLATAFORMAS DE VALORES 2008, 2014 Y 2021</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
