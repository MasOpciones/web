import React, { useEffect, useState } from "react";

const REFORMAS = [
  {
    año: 1985,
    nombre: "PAE I",
    descripcion:
      "Banco Mundial financia ajuste estructural. Objetivo declarado: reestructurar el Estado.",
    resultado:
      "La reforma institucional no se tocó. Solo se ejecutó la apertura comercial.",
    tipo: "fallida",
  },
  {
    año: 1988,
    nombre: "COREC",
    descripcion:
      "Diagnóstico bipartidista más completo hasta entonces. Recomendaciones concretas.",
    resultado:
      "Archivado. No le gustó a la empresa privada ni a la cúpula política.",
    tipo: "fallida",
  },
  {
    año: 1990,
    nombre: "Ministerio de Reforma del Estado",
    descripcion: "Creado para implementar la COREC.",
    resultado:
      "La reforma profunda no se ejecutó. Bajo ese mismo gobierno el Estado creció más que nunca: 84 instituciones nuevas.",
    tipo: "fallida",
  },
  {
    año: 1992,
    nombre: "PAE II y PAE III",
    descripcion:
      "Más ajuste estructural. Liberalización comercial y financiera.",
    resultado:
      "La reforma institucional siguió pendiente. El patrón se repite con exactitud.",
    tipo: "fallida",
  },
  {
    año: 2018,
    nombre: "Ley 9635",
    descripcion:
      "Fortalecimiento de las Finanzas Públicas. Introduce la regla fiscal.",
    resultado:
      "Vigente. Pero el 95% del gasto ya estaba preasignado — la regla opera sobre el margen, no la estructura.",
    tipo: "parcial",
  },
  {
    año: 2021,
    nombre: "Ley Marco de Empleo Público",
    descripcion:
      "Objetivo: unificar regímenes salariales y poner orden en pluses.",
    resultado:
      "Implementación parcial. Apelada sistemáticamente. Relación incentivos/salario bajó de 1.0 a 0.96.",
    tipo: "parcial",
  },
  {
    año: 2022,
    nombre: "Comisión Legislativa de Reforma del Estado",
    descripcion:
      "CGR presenta diagnóstico de 9 sectores con duplicidades. Audiencias, expertos, ministros.",
    resultado: "Ninguna ley. Ninguna fusión. Ningún cierre.",
    tipo: "fallida",
  },
];

const DOT_COLOR = { fallida: "#ef4444", parcial: "#f59e0b" };
const BADGE_TEXT = { fallida: "#f87171", parcial: "#fbbf24" };
const BADGE_LABEL = { fallida: "sin reforma estructural", parcial: "parcial" };

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
  padding: "28px 24px 24px",
  border: "1px solid var(--border)",
  boxShadow: "var(--viz-shadow)",
};

export default function GraficoTimelineReformas() {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setMounted(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section style={sectionStyle}>
      {/* Panel */}
      <div style={panelStyle}>
        {/* Timeline track */}
        <div style={{ position: "relative", paddingLeft: 36 }}>

          {/* Vertical spine — single color, no gradient */}
          <div style={{
            position:     "absolute",
            left:         10,
            top:          6,
            bottom:       6,
            width:        2,
            background:   "var(--border)",
            borderRadius: 1,
          }} />

          {REFORMAS.map((r, i) => {
            const isLast   = i === REFORMAS.length - 1;
            const isHov    = hovered === i;
            const dotColor = DOT_COLOR[r.tipo];
            const delay    = `${i * 0.08}s`;

            return (
              <div
                key={r.año}
                style={{
                  position:     "relative",
                  marginBottom: isLast ? 0 : 28,
                  opacity:      mounted ? 1 : 0,
                  transform:    mounted ? "translateY(0)" : "translateY(14px)",
                  transition:   `opacity 0.45s ease ${delay}, transform 0.45s ease ${delay}`,
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Dot — smaller, no outline, glow only on hover */}
                <div style={{
                  position:        "absolute",
                  left:            -36 + 5,
                  top:             4,
                  width:           10,
                  height:          10,
                  borderRadius:    "50%",
                  background:      "#0d1117",
                  border:          `2px solid ${dotColor}`,
                  boxShadow:       isHov ? `0 0 8px ${dotColor}99` : "none",
                  transition:      "box-shadow 0.2s ease",
                  zIndex:          1,
                }} />

                {/* Card */}
                <div style={{
                  borderLeft:    `3px solid ${isHov ? dotColor : "transparent"}`,
                  paddingLeft:   14,
                  paddingTop:    2,
                  paddingBottom: 2,
                  transition:    "border-color 0.2s ease",
                  cursor:        "default",
                }}>
                  {/* Year + name + badge row */}
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "6px 10px", marginBottom: 4 }}>
                    <span style={{
                      fontFamily:         "var(--font-sans)",
                      fontSize:           15,
                      fontWeight:         800,
                      color:              "#60ff12",
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {r.año}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-sans)",
                      fontSize:   14,
                      fontWeight: 700,
                      color:      "#f3f4f6",
                    }}>
                      {r.nombre}
                    </span>
                    {/* Badge — text only, no border, no background */}
                    <span style={{
                      fontFamily:    "var(--font-sans)",
                      fontSize:      9.5,
                      fontWeight:    600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color:         BADGE_TEXT[r.tipo],
                      opacity:       0.6,
                    }}>
                      {BADGE_LABEL[r.tipo]}
                    </span>
                  </div>

                  {/* Descripcion */}
                  <p style={{
                    margin:      "0 0 5px",
                    fontFamily:  "var(--font-sans)",
                    fontSize:    12.5,
                    lineHeight:  1.5,
                    color:       "#9ca3af",
                  }}>
                    {r.descripcion}
                  </p>

                  {/* Resultado — plain text, color as prefix dot */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                    <span style={{
                      flexShrink:   0,
                      marginTop:    5,
                      width:        5,
                      height:       5,
                      borderRadius: "50%",
                      background:   dotColor,
                      opacity:      0.6,
                    }} />
                    <p style={{
                      margin:     0,
                      fontFamily: "var(--font-sans)",
                      fontSize:   12,
                      lineHeight: 1.5,
                      color:      "var(--text-muted)",
                    }}>
                      {r.resultado}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom callout — no red background */}
        <div style={{
          marginTop:  28,
          paddingTop: 14,
          borderTop:  "1px solid var(--border)",
          fontFamily: "var(--font-sans)",
          fontSize:   13,
          lineHeight: 1.55,
          color:      "var(--text-muted)",
          opacity:    mounted ? 1 : 0,
          transition: `opacity 0.45s ease ${REFORMAS.length * 0.08 + 0.1}s`,
        }}>
          El patrón se repite en cada intento: diagnóstico, comisión, propuesta,{" "}
          <strong style={{ color: "#f87171", fontWeight: 700 }}>archivo</strong>.
          Costa Rica ha tenido más comisiones de reforma que países con reformas reales.
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        display:            "flex",
        justifyContent:     "space-between",
        alignItems:         "center",
        gap:                12,
        marginTop:          10,
        fontSize:           10,
        textTransform:      "uppercase",
        color:              "var(--text-muted)",
        fontFamily:         "var(--font-sans)",
        fontVariantNumeric: "tabular-nums",
        letterSpacing:      "0.04em",
      }}>
        <span>FUENTE: MIDEPLAN, CGR, Asamblea Legislativa</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
