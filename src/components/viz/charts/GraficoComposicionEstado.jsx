import React, { useEffect, useRef, useState } from "react";

const TOTAL = 332;

// Ordered largest → smallest
const CATS = [
  { nombre: "Otras",             count: 106, fill: "var(--text-muted)", fillOp: 0.25, candado: false,
    nota: "Descentralizadas no empresariales, fondos y fideicomisos" },
  { nombre: "Municipalidades",   count: 82,  fill: "var(--text-muted)", fillOp: 0.4,  candado: false,
    nota: "Gobiernos locales con autonomía administrativa" },
  { nombre: "Órganos adscritos", count: 67,  fill: "var(--text-muted)", fillOp: 0.65, candado: false,
    nota: "Sin personalidad jurídica propia — creados por decreto" },
  { nombre: "Autónomas",         count: 36,  fill: "var(--accent)",     fillOp: 0.85, candado: true,
    nota: "Autonomía constitucional — requiere 2/3 para reformar" },
  { nombre: "Empresas públicas", count: 22,  fill: "var(--accent)",     fillOp: 0.45, candado: true,
    nota: "Requieren 2/3 de la Asamblea para ser fusionadas o suprimidas" },
  { nombre: "Ministerios",       count: 19,  fill: "var(--text-muted)", fillOp: 0.5,  candado: false,
    nota: "Bajo el poder ejecutivo directo" },
];

const CANDADO_INDICES = [3, 4]; // Autónomas, Empresas públicas

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
  overflow: "visible",
  background:
    "radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 8%, transparent), transparent 36%), " +
    "linear-gradient(160deg, var(--viz-panel-strong) 0%, var(--viz-panel) 100%)",
  borderRadius: "16px",
  padding: "20px",
  border: "1px solid var(--border)",
  boxShadow: "var(--viz-shadow)",
};

const tooltipStyle = {
  position:             "absolute",
  background:           "var(--viz-tooltip-bg)",
  border:               "1px solid var(--viz-tooltip-border)",
  borderRadius:         6,
  padding:              "8px 12px",
  boxShadow:            "var(--viz-tooltip-shadow)",
  backdropFilter:       "var(--viz-tooltip-backdrop)",
  WebkitBackdropFilter: "var(--viz-tooltip-backdrop)",
  pointerEvents:        "none",
  minWidth:             170,
  zIndex:               10,
};

export default function GraficoComposicionEstado() {
  const wrapRef = useRef(null);
  const [animated, setAnimated] = useState(false);
  const [hovered,  setHovered]  = useState(null);
  const [tooltip,  setTooltip]  = useState(null);

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimated(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  function handleEnter(e, i) {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setHovered(i);
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      right: e.clientX - rect.left > rect.width / 2,
    });
  }
  function handleMove(e, i) {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setTooltip((prev) => prev ? {
      ...prev,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      right: e.clientX - rect.left > rect.width / 2,
    } : null);
  }

  return (
    <section style={sectionStyle}>
      <div
        style={panelStyle}
        ref={wrapRef}
        onMouseLeave={() => { setHovered(null); setTooltip(null); }}
      >
        {/* Bar rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CATS.map((cat, i) => {
            const pct      = (cat.count / TOTAL) * 100;
            const isHov    = hovered === i;
            const isCandado = CANDADO_INDICES.includes(i);
            const barOp    = animated
              ? (hovered === null ? cat.fillOp : isHov ? Math.min(cat.fillOp + 0.2, 1) : cat.fillOp * 0.6)
              : 0;
            const delay    = `${i * 0.04}s`;

            return (
              <React.Fragment key={cat.nombre}>
                {/* Separator before candado group */}
                {i === CANDADO_INDICES[0] && (
                  <div style={{
                    borderTop:  "1px solid var(--border)",
                    opacity:    animated ? 0.5 : 0,
                    transition: "opacity 0.4s ease 0.3s",
                    margin:     "2px 0",
                  }} />
                )}

                <div
                  style={{
                    display:    "flex",
                    alignItems: "center",
                    gap:        10,
                    cursor:     "default",
                    opacity:    animated ? 1 : 0,
                    transform:  animated ? "translateX(0)" : "translateX(-8px)",
                    transition: `opacity 0.4s ease ${delay}, transform 0.4s ease ${delay}`,
                  }}
                  onMouseEnter={(e) => handleEnter(e, i)}
                  onMouseMove={(e)  => handleMove(e, i)}
                  onMouseLeave={() => { setHovered(null); setTooltip(null); }}
                >
                  {/* Label */}
                  <span style={{
                    ...TXT,
                    fontSize:   12,
                    color:      isHov ? "var(--text)" : "var(--text-muted)",
                    width:      160,
                    flexShrink: 0,
                    transition: "color 0.15s ease",
                  }}>
                    {cat.nombre}
                  </span>

                  {/* Bar track */}
                  <div style={{
                    flex:         1,
                    height:       8,
                    borderRadius: 999,
                    background:   "rgba(255,255,255,0.06)",
                    overflow:     "hidden",
                    position:     "relative",
                  }}>
                    <div style={{
                      position:     "absolute",
                      left:         0, top: 0, bottom: 0,
                      width:        animated ? `${pct}%` : "0%",
                      borderRadius: 999,
                      background:   cat.fill,
                      opacity:      barOp,
                      transition:   `width 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}, opacity 0.3s ease`,
                    }} />
                  </div>

                  {/* Count */}
                  <span style={{
                    ...TXT,
                    fontSize:   11,
                    fontWeight: 700,
                    color:      isCandado ? "var(--accent)" : "var(--text-muted)",
                    opacity:    isCandado ? (animated ? 1 : 0) : (animated ? 0.7 : 0),
                    width:      28,
                    textAlign:  "right",
                    flexShrink: 0,
                    transition: "opacity 0.3s ease",
                  }}>
                    {cat.count}
                  </span>
                </div>

                {/* Separator + annotation after candado group */}
                {i === CANDADO_INDICES[CANDADO_INDICES.length - 1] && (
                  <div style={{
                    opacity:    animated ? 1 : 0,
                    transition: "opacity 0.5s ease 0.5s",
                  }}>
                    <div style={{
                      borderTop: "1px solid var(--border)",
                      opacity:   0.5,
                      margin:    "4px 0 8px",
                    }} />
                    <p style={{
                      ...TXT,
                      fontSize:  11,
                      color:     "var(--text-muted)",
                      fontStyle: "italic",
                      margin:    0,
                      lineHeight: 1.5,
                    }}>
                      Las autónomas y empresas públicas (58 entidades) controlan el 60–70% del gasto.
                      Reformarlas requiere 2/3 de la Asamblea.
                    </p>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Tooltip */}
        {tooltip && hovered !== null && (
          <div style={{
            ...tooltipStyle,
            left: `${tooltip.x + (tooltip.right ? -190 : 14)}px`,
            top:  `${tooltip.y - 14}px`,
          }}>
            <div style={{ ...TXT, fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
              {CATS[hovered].nombre}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <span style={{ ...TXT, fontSize: 11, color: "var(--text-muted)" }}>Cantidad</span>
              <strong style={{ ...TXT, fontSize: 11, color: "var(--text)" }}>{CATS[hovered].count}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <span style={{ ...TXT, fontSize: 11, color: "var(--text-muted)" }}>Del total</span>
              <strong style={{ ...TXT, fontSize: 11, color: "var(--text)" }}>
                {((CATS[hovered].count / TOTAL) * 100).toFixed(1)}%
              </strong>
            </div>
            <div style={{
              ...TXT, fontSize: 10.5, color: "var(--text-muted)",
              marginTop: 6, lineHeight: 1.45,
            }}>
              {CATS[hovered].nota}
            </div>
            {CATS[hovered].candado && (
              <div style={{ ...TXT, fontSize: 10, color: "var(--accent)", marginTop: 5 }}>
                Requiere 2/3 de la Asamblea para reformar
              </div>
            )}
          </div>
        )}
      </div>

      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 10, fontSize: 10, textTransform: "uppercase",
        color: "var(--text-muted)", ...TXT, letterSpacing: "0.04em",
      }}>
        <span>FUENTE: MIDEPLAN — Inventario de Instituciones Públicas</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
