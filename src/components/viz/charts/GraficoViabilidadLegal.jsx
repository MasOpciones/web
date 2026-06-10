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

const ESTADO_COLOR = {
  factible: "var(--accent)",
  posible:  "var(--text-muted)",
  reforma:  "var(--text-muted)",
};

const ESTADO_OPACITY = {
  factible: 1,
  posible:  0.55,
  reforma:  0.3,
};

const ESTADO_LABEL = {
  factible: "Hoy",
  posible:  "Con coordinación",
  reforma:  "Requiere reforma legal",
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
  background:
    "radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 8%, transparent), transparent 36%), " +
    "linear-gradient(160deg, var(--viz-panel-strong) 0%, var(--viz-panel) 100%)",
  borderRadius: "16px",
  padding: "20px",
  border: "1px solid var(--border)",
  boxShadow: "var(--viz-shadow)",
};

export default function GraficoViabilidadLegal() {
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered] = useState(null);

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
                background: ESTADO_COLOR[estado],
                opacity: ESTADO_OPACITY[estado],
              }} />
              <span style={{ ...TXT, fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Rows */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {HERRAMIENTAS.map((h, i) => {
            const isHov = hovered === i;
            const isLast = i === HERRAMIENTAS.length - 1;
            const delay = `${i * 0.06}s`;
            const color = ESTADO_COLOR[h.estado];
            const opacity = ESTADO_OPACITY[h.estado];

            // Separator between etapas
            const prevEtapa = i > 0 ? HERRAMIENTAS[i - 1].etapa : null;
            const showSep = prevEtapa && prevEtapa !== h.etapa;

            return (
              <React.Fragment key={h.nombre}>
                {showSep && (
                  <div style={{
                    borderTop: "1px solid var(--border)",
                    opacity: animated ? 0.4 : 0,
                    transition: `opacity 0.4s ease ${delay}`,
                    margin: "2px 0",
                  }} />
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    padding: "10px 8px",
                    borderBottom: isLast ? "none" : "1px solid var(--border)",
                    borderRadius: 6,
                    background: isHov ? "rgba(255,255,255,0.02)" : "transparent",
                    cursor: "default",
                    opacity: animated ? 1 : 0,
                    transform: animated ? "translateX(0)" : "translateX(-8px)",
                    transition: `opacity 0.4s ease ${delay}, transform 0.4s ease ${delay}, background 0.15s ease`,
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Status dot */}
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: color,
                    opacity: isHov ? Math.min(opacity * 1.5, 1) : opacity,
                    flexShrink: 0,
                    marginTop: 4,
                    transition: "opacity 0.15s ease",
                  }} />

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                      <span style={{
                        ...TXT,
                        fontSize: 12,
                        fontWeight: 600,
                        color: isHov ? "var(--text)" : color === "var(--accent)" ? "var(--text)" : "var(--text-muted)",
                        transition: "color 0.15s ease",
                        lineHeight: 1.3,
                      }}>
                        {h.nombre}
                      </span>
                      <span style={{
                        ...TXT,
                        fontSize: 10,
                        color: color,
                        opacity: opacity,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}>
                        {h.etapa}
                      </span>
                    </div>
                    {isHov && (
                      <div style={{
                        ...TXT, fontSize: 11,
                        color: "var(--text-muted)",
                        marginTop: 4, lineHeight: 1.5,
                      }}>
                        {h.requiere} · {h.ley}
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
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
