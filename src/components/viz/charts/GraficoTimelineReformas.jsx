import React, { useEffect, useRef, useState } from "react";

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

const DOT_COLOR = { fallida: "#ef4444", parcial: "var(--text-muted)" };
const BADGE_TEXT = { fallida: "#f87171", parcial: "var(--text-muted)" };
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

const tooltipStyle = {
  position:             "absolute",
  background:           "var(--viz-tooltip-bg)",
  border:               "1px solid var(--viz-tooltip-border)",
  borderRadius:         8,
  padding:              "12px 14px",
  boxShadow:            "var(--viz-tooltip-shadow)",
  backdropFilter:       "var(--viz-tooltip-backdrop)",
  WebkitBackdropFilter: "var(--viz-tooltip-backdrop)",
  pointerEvents:        "none",
  maxWidth:             320,
  zIndex:               10,
};

export default function GraficoTimelineReformas() {
  const panelRef = useRef(null);
  const [mounted,    setMounted]    = useState(false);
  const [hovered,    setHovered]    = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setMounted(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  function handleMouseMove(e, i) {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    setHovered(i);
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      right: e.clientX - rect.left > rect.width / 2,
    });
  }

  const hoveredReforma = hovered !== null ? REFORMAS[hovered] : null;

  return (
    <section style={sectionStyle}>
      {/* Panel */}
      <div style={{ ...panelStyle, position: "relative" }} ref={panelRef}>
        {/* Timeline track */}
        <div style={{ position: "relative", paddingLeft: 36 }}>

          {REFORMAS.map((r, i) => {
            const isLast   = i === REFORMAS.length - 1;
            const isHov    = hovered === i;
            const delay    = `${i * 0.08}s`;
            // Dot center is at left: -31 + 4 = -27; 2px line centered → left: -28
            const connLeft = -28;

            return (
              <div
                key={r.año}
                style={{
                  position:     "relative",
                  marginBottom: isLast ? 0 : 16,
                  opacity:      mounted ? 1 : 0,
                  transform:    mounted ? "translateY(0)" : "translateY(14px)",
                  transition:   `opacity 0.45s ease ${delay}, transform 0.45s ease ${delay}`,
                  cursor:       "default",
                }}
                onMouseMove={(e) => handleMouseMove(e, i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Connector from previous item gap to this dot top */}
                {i > 0 && (
                  <div style={{
                    position:   "absolute",
                    left:       connLeft,
                    top:        -8,
                    height:     14,
                    width:      2,
                    background: "rgba(107,114,128,0.4)",
                  }} />
                )}

                {/* Dot — all same green, brightens on hover */}
                <div style={{
                  position:     "absolute",
                  left:         -31,
                  top:          6,
                  width:        8,
                  height:       8,
                  borderRadius: "50%",
                  background:   isHov ? "var(--accent)" : "rgba(96,255,18,0.3)",
                  boxShadow:    isHov ? "0 0 8px rgba(96,255,18,0.65)" : "none",
                  transition:   "background 0.2s ease, box-shadow 0.2s ease",
                  zIndex:       1,
                }} />

                {/* Connector from this dot bottom to next item gap */}
                {!isLast && (
                  <div style={{
                    position:   "absolute",
                    left:       connLeft,
                    top:        14,
                    bottom:     -8,
                    width:      2,
                    background: "rgba(107,114,128,0.4)",
                  }} />
                )}

                {/* Card */}
                <div style={{
                  borderLeft:    `3px solid ${isHov ? "var(--accent)" : "transparent"}`,
                  paddingLeft:   14,
                  paddingTop:    2,
                  paddingBottom: 2,
                  transition:    "border-color 0.2s ease",
                  cursor:        "default",
                }}>
                  {/* Year + name + badge row */}
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "6px 10px" }}>
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
                      color:      isHov ? "var(--text)" : "var(--text)",
                    }}>
                      {r.nombre}
                    </span>
                    {/* Badge — text only */}
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
                </div>
              </div>
            );
          })}
        </div>

        {/* Tooltip */}
        {hoveredReforma && (
          <div style={{
            ...tooltipStyle,
            left: tooltipPos.right
              ? `${tooltipPos.x - 330}px`
              : `${tooltipPos.x + 16}px`,
            top: `${tooltipPos.y - 10}px`,
          }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6,
              fontFamily: "var(--font-sans)", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {hoveredReforma.año} · {hoveredReforma.nombre}
            </div>
            <p style={{ margin: "0 0 8px", fontFamily: "var(--font-sans)",
              fontSize: 12.5, lineHeight: 1.5, color: "var(--text-muted)" }}>
              {hoveredReforma.descripcion}
            </p>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
              <span style={{ flexShrink: 0, marginTop: 5, width: 5, height: 5,
                borderRadius: "50%", background: DOT_COLOR[hoveredReforma.tipo], opacity: 0.7 }} />
              <p style={{ margin: 0, fontFamily: "var(--font-sans)",
                fontSize: 12, lineHeight: 1.5, color: "var(--text-muted)" }}>
                {hoveredReforma.resultado}
              </p>
            </div>
          </div>
        )}

        {/* Bottom callout — no red background */}
        <div style={{
          marginTop:  20,
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
