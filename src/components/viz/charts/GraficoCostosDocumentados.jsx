import React, { useEffect, useRef, useState } from "react";

const ROWS = [
  {
    id:        "creditos",
    valor:     "₡183,972 M",
    desc:      "Créditos productivos otorgados dos veces",
    fuente:    "CGR DFOE-EC-IF-00006-2022 — 693 personas recibieron crédito de dos fuentes públicas simultáneamente",
    estimated: false,
  },
  {
    id:        "cnp",
    valor:     "₡1,096 M",
    desc:      "Pérdidas por inventario destruido — CNP 2024",
    fuente:    "CGR — 6 t de arroz y 3.7 t de frijoles desechados. Fideicomiso al 91% de capacidad consumida",
    estimated: false,
  },
  {
    id:        "estructuras",
    valor:     "₡6,331 M*",
    desc:      "Costo anual estimado de 67 estructuras redundantes",
    fuente:    "* Estimación propia basada en escalas MIDEPLAN/Servicio Civil 2024 — no existe cifra oficial",
    estimated: true,
  },
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
  boxSizing: "border-box",
  background: "var(--viz-panel)",
  borderRadius: "16px",
  padding: "20px",
  border: "1px solid var(--border)",
  overflow: "hidden",
};

export default function GraficoCostosDocumentados() {
  const ref    = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section style={sectionStyle}>
      <div style={panelStyle} ref={ref}>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {ROWS.map((row, i) => {
            const isLast = i === ROWS.length - 1;
            const showDash = i === 1; // dashed separator before estimated row

            return (
              <React.Fragment key={row.id}>
                {showDash && (
                  <div style={{
                    borderTop: "1px dashed var(--border)",
                    margin: "4px 0",
                    opacity: active ? 0.6 : 0,
                    transition: "opacity 0.4s ease 0.3s",
                  }} />
                )}
                <div style={{
                  display:    "flex",
                  alignItems: "flex-start",
                  gap:        20,
                  padding:    "14px 0",
                  borderBottom: isLast ? "none" : (showDash ? "none" : "1px solid var(--border)"),
                  opacity:    active ? 1 : 0,
                  transform:  active ? "translateY(0)" : "translateY(8px)",
                  transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
                }}>
                  {/* Number */}
                  <div style={{ minWidth: 140, flexShrink: 0 }}>
                    <div style={{
                      ...TXT,
                      fontSize:   "clamp(1.6rem, 4vw, 2.2rem)",
                      fontWeight: 800,
                      lineHeight: 1,
                      color:      row.estimated ? "var(--text-muted)" : "var(--text)",
                      opacity:    row.estimated ? 0.65 : 1,
                    }}>
                      {row.valor}
                    </div>
                  </div>

                  {/* Separator */}
                  <div style={{
                    width: 1, alignSelf: "stretch", minHeight: 36,
                    background: "var(--border)", flexShrink: 0,
                    opacity: 0.5,
                  }} />

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      ...TXT, fontSize: 13, fontWeight: 500,
                      color:      row.estimated ? "var(--text-muted)" : "var(--text)",
                      opacity:    row.estimated ? 0.75 : 1,
                      lineHeight: 1.3, marginBottom: 5,
                    }}>
                      {row.desc}
                    </div>
                    <div style={{
                      ...TXT, fontSize: 11,
                      color:      "var(--text-muted)",
                      lineHeight: 1.45,
                      fontStyle:  row.estimated ? "italic" : "normal",
                      opacity:    row.estimated ? 0.6 : 0.8,
                    }}>
                      {row.fuente}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Nota estimación */}
        <div style={{
          ...TXT,
          marginTop:   14,
          paddingTop:  12,
          borderTop:   "1px solid var(--border)",
          fontSize:    10,
          fontStyle:   "italic",
          color:       "var(--text-muted)",
          opacity:     active ? 0.55 : 0,
          transition:  "opacity 0.5s ease 0.4s",
          lineHeight:  1.5,
        }}>
          * Estimación: 4 puestos de soporte × 67 estructuras × escala salarial MIDEPLAN 2024 + cargas sociales 26%.
          No existe cifra oficial — esa ausencia es parte del diagnóstico.
        </div>
      </div>

      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 10, fontSize: 10, textTransform: "uppercase",
        color: "var(--text-muted)", ...TXT, letterSpacing: "0.04em",
      }}>
        <span>FUENTE: CGR · MHCP · MIDEPLAN — Informes 2022–2024</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
