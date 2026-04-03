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

const DOT_COLOR  = { fallida: "#ef4444", parcial: "#f59e0b" };
const BADGE_CFG  = {
  fallida: { label: "sin reforma estructural", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.3)",  text: "#f87171" },
  parcial: { label: "parcial",                 bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", text: "#fbbf24" },
};
const RES_COLOR  = { fallida: "#fca5a5", parcial: "#fcd34d" };

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
      {/* Header */}
      <header style={{ marginBottom: 14 }}>
        <p style={{
          margin: 0, fontSize: 11, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "var(--text-muted)",
          fontWeight: 700, fontFamily: "var(--font-sans)",
        }}>
          ACTO V · HISTORIA DE LAS REFORMAS
        </p>
        <h3 style={{
          fontSize: "clamp(1.3rem, 2.8vw, 1.9rem)", fontWeight: 800,
          lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--text)",
          margin: "4px 0 6px", fontFamily: "var(--font-sans)",
        }}>
          7 intentos. 37 años. Ninguna reforma estructural.
        </h3>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, fontFamily: "var(--font-sans)" }}>
          Cronología de los intentos de racionalización del Estado costarricense · 1985–2022
        </p>
      </header>

      {/* Panel */}
      <div style={panelStyle}>
        {/* Timeline track */}
        <div style={{ position: "relative", paddingLeft: 36 }}>

          {/* Vertical spine */}
          <div style={{
            position: "absolute",
            left: 10,
            top: 6,
            bottom: 6,
            width: 2,
            background: "linear-gradient(to bottom, #374151 0%, #1f2937 100%)",
            borderRadius: 1,
          }} />

          {REFORMAS.map((r, i) => {
            const isLast   = i === REFORMAS.length - 1;
            const isHov    = hovered === i;
            const dotColor = DOT_COLOR[r.tipo];
            const badge    = BADGE_CFG[r.tipo];
            const resColor = RES_COLOR[r.tipo];
            const delay    = `${i * 0.08}s`;

            return (
              <div
                key={r.año}
                style={{
                  position:   "relative",
                  marginBottom: isLast ? 0 : 28,
                  opacity:    mounted ? 1 : 0,
                  transform:  mounted ? "translateY(0)" : "translateY(14px)",
                  transition: `opacity 0.45s ease ${delay}, transform 0.45s ease ${delay}`,
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Dot */}
                <div style={{
                  position:     "absolute",
                  left:         -36 + 4,   // center on spine (spine at left:10, dot width:14 → left: 10 - 7 = 3 from container edge, accounting for paddingLeft:36)
                  top:          5,
                  width:        14,
                  height:       14,
                  borderRadius: "50%",
                  background:   dotColor,
                  boxShadow:    `0 0 ${isHov ? 10 : 5}px ${dotColor}${isHov ? "cc" : "66"}`,
                  transition:   "box-shadow 0.2s ease",
                  zIndex:       1,
                  border:       `2px solid ${dotColor}`,
                  backgroundColor: "#0d1117",
                  outline:      `3px solid ${dotColor}`,
                  outlineOffset: 0,
                }} />

                {/* Card */}
                <div style={{
                  borderLeft:       `3px solid ${isHov ? dotColor : "#1f2937"}`,
                  paddingLeft:      14,
                  paddingTop:       2,
                  paddingBottom:    2,
                  transition:       "border-color 0.2s ease",
                  cursor:           "default",
                }}>
                  {/* Year + name row */}
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "6px 10px", marginBottom: 4 }}>
                    <span style={{
                      fontFamily: "var(--font-sans)", fontSize: 15,
                      fontWeight: 800, color: "#60ff12",
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {r.año}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-sans)", fontSize: 14,
                      fontWeight: 700, color: "#f3f4f6",
                    }}>
                      {r.nombre}
                    </span>
                    {/* Badge */}
                    <span style={{
                      fontFamily:   "var(--font-sans)",
                      fontSize:     9.5,
                      fontWeight:   600,
                      letterSpacing:"0.06em",
                      textTransform:"uppercase",
                      color:        badge.text,
                      background:   badge.bg,
                      border:       `1px solid ${badge.border}`,
                      borderRadius: 4,
                      padding:      "1px 6px",
                      lineHeight:   "1.6",
                    }}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Descripcion */}
                  <p style={{
                    margin: "0 0 5px",
                    fontFamily: "var(--font-sans)",
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    color: "#9ca3af",
                  }}>
                    {r.descripcion}
                  </p>

                  {/* Resultado */}
                  <div style={{
                    display:      "flex",
                    alignItems:   "flex-start",
                    gap:          7,
                    background:   `${dotColor}0d`,
                    borderRadius: 6,
                    padding:      "5px 9px",
                  }}>
                    <span style={{
                      flexShrink: 0,
                      marginTop:  2,
                      width:      6,
                      height:     6,
                      borderRadius: "50%",
                      background: dotColor,
                      opacity:    0.8,
                    }} />
                    <p style={{
                      margin: 0,
                      fontFamily: "var(--font-sans)",
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: resColor,
                      opacity: 0.9,
                    }}>
                      {r.resultado}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom callout */}
        <div style={{
          marginTop:    28,
          padding:      "10px 14px",
          borderLeft:   "3px solid #ef4444",
          background:   "rgba(239,68,68,0.05)",
          borderRadius: "0 8px 8px 0",
          fontFamily:   "var(--font-sans)",
          fontSize:     13,
          lineHeight:   1.55,
          color:        "var(--text-muted)",
          opacity:      mounted ? 1 : 0,
          transition:   `opacity 0.45s ease ${REFORMAS.length * 0.08 + 0.1}s`,
        }}>
          El patrón se repite en cada intento: diagnóstico, comisión, propuesta,{" "}
          <strong style={{ color: "#f87171", fontWeight: 700 }}>archivo</strong>.
          Costa Rica ha tenido más comisiones de reforma que países con reformas reales.
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 10, fontSize: 10, textTransform: "uppercase",
        color: "var(--text-muted)", fontFamily: "var(--font-sans)",
        fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em",
      }}>
        <span>FUENTE: MIDEPLAN, CGR, Asamblea Legislativa</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
