import React, { useEffect, useState } from "react";

const HERRAMIENTAS = [
  {
    etapa: "Inmediata",
    nombre: "Fachada verde + planta baja activa",
    estado: "factible",
    requiere: "8ª modificación del Plan Regulador de San José",
    ley: "Ley 4240",
  },
  {
    etapa: "Inmediata",
    nombre: "Restricción de tráfico en calles locales",
    estado: "factible",
    requiere: "Decisión ejecutiva de la MSJ — competencia directa",
    ley: "Competencia municipal",
  },
  {
    etapa: "Corto plazo",
    nombre: "Entidad autónoma tipo ECH de Quito",
    estado: "posible",
    requiere: "Ley especial o acuerdo del Concejo + aprobación CGR",
    ley: "Ley 8131 / Código Municipal",
  },
  {
    etapa: "Mediano plazo",
    nombre: "Zonas de Desarrollo Especial con exoneración fiscal",
    estado: "reforma",
    requiere: "Nueva ley especial — precedente en Ley de Zonas Francas 7210",
    ley: "Requiere legislación",
  },
  {
    etapa: "Mediano plazo",
    nombre: "Peaje urbano / congestion charge",
    estado: "reforma",
    requiere: "Reforma a Ley de Tránsito No. 9078",
    ley: "Requiere legislación",
  },
  {
    etapa: "Largo plazo",
    nombre: "Transferencia de Derechos de Desarrollo (TDR)",
    estado: "reforma",
    requiere: "Reforma a Ley 4240 + Plan Regulador",
    ley: "Requiere legislación",
  },
  {
    etapa: "Largo plazo",
    nombre: "Business Improvement Districts (BIDs)",
    estado: "reforma",
    requiere: "Nueva ley habilitante — sin precedente en CR",
    ley: "Requiere legislación",
  },
];

// naranja de estado intermedio — sin variable en el sistema
const NARANJA = "#f5a623";

const ESTADO_DOT_COLOR = {
  factible: "var(--accent)",
  posible: NARANJA,
  reforma: "var(--text-muted)",
};

const ESTADO_DOT_OPACITY = {
  factible: 1,
  posible: 1,
  reforma: 0.6,
};

const ESTADO_LABEL = {
  factible: "Hoy",
  posible: "Con coordinación",
  reforma: "Requiere reforma legal",
};

const ETAPA_STYLE = {
  "Inmediata": { color: "var(--accent)", weight: 600 },
  "Corto plazo": { color: NARANJA, weight: 500 },
  "Mediano plazo": { color: "var(--text-muted)", weight: 400 },
  "Largo plazo": { color: "var(--text-muted)", weight: 400 },
};

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

export default function GraficoViabilidadLegal() {
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimated(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section style={sectionStyle}>
      <div style={panelStyle}>

        {/* Legend */}
        <div style={{
          display: "flex", gap: 20, marginBottom: 16,
          opacity: animated ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}>
          {Object.entries(ESTADO_LABEL).map(([estado, label]) => (
            <div key={estado} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: ESTADO_DOT_COLOR[estado],
                opacity: ESTADO_DOT_OPACITY[estado],
              }} />
              <span style={{ ...TXT, fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Rows */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {HERRAMIENTAS.map((h, i) => {
            const isHov = hovered === i;
            const isExpanded = expanded === i;
            const isLast = i === HERRAMIENTAS.length - 1;
            const delay = `${i * 0.06}s`;
            const etapaStyle = ETAPA_STYLE[h.etapa];

            return (
              <div
                key={h.nombre}
                style={{
                  borderBottom: isLast ? "none" : "1px solid color-mix(in srgb, var(--border) 20%, transparent)",
                  opacity: animated ? 1 : 0,
                  transform: animated ? "translateX(0)" : "translateX(-8px)",
                  transition: `opacity 0.4s ease ${delay}, transform 0.4s ease ${delay}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 0",
                    borderRadius: 6,
                    background: isHov ? "var(--viz-panel)" : "transparent",
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setExpanded(isExpanded ? null : i)}
                >
                  {/* Status dot */}
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: ESTADO_DOT_COLOR[h.estado],
                    opacity: ESTADO_DOT_OPACITY[h.estado],
                    flexShrink: 0,
                  }} />

                  {/* Nombre */}
                  <span style={{
                    ...TXT,
                    flex: 1,
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--text)",
                    lineHeight: 1.3,
                  }}>
                    {h.nombre}
                  </span>

                  {/* Etapa */}
                  <span style={{
                    ...TXT,
                    fontSize: 12,
                    fontWeight: etapaStyle.weight,
                    color: etapaStyle.color,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}>
                    {h.etapa}
                  </span>

                  {/* Chevron */}
                  <span style={{
                    display: "inline-block",
                    fontSize: 10,
                    color: "var(--text-muted)",
                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.15s ease",
                    flexShrink: 0,
                  }}>
                    ›
                  </span>
                </div>

                {isExpanded && (
                  <div style={{
                    background: "var(--viz-panel)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    marginBottom: 10,
                  }}>
                    <div style={{ ...TXT, fontSize: 12, color: "var(--text-muted)", marginBottom: 4, lineHeight: 1.65 }}>
                      Requiere: <span style={{ color: "var(--text)" }}>{h.requiere}</span>
                    </div>
                    <div style={{ ...TXT, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.65 }}>
                      Base legal: <span style={{ color: "var(--text)" }}>{h.ley}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer summary */}
        <div style={{
          marginTop: 16, paddingTop: 12,
          borderTop: "1px solid var(--border)",
          opacity: animated ? 1 : 0,
          transition: "opacity 0.5s ease 0.5s",
        }}>
          <span style={{ ...TXT, fontSize: 11, color: "var(--text-muted)" }}>
            2 herramientas disponibles hoy sin nueva legislación · 1 posible con coordinación interinstitucional · 4 requieren reformas específicas
          </span>
        </div>
      </div>

      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 10, fontSize: 10, textTransform: "uppercase",
        color: "var(--text-muted)", ...TXT, letterSpacing: "0.04em",
      }}>
        <span>FUENTE: LEY 4240, LEY 9078, CÓDIGO MUNICIPAL, LEY 8131, LEY 7210</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
