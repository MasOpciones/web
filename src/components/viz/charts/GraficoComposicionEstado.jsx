import React, { useEffect, useRef, useState } from "react";

const TOTAL = 332;
const CATS = [
  { nombre: "Ministerios",       count: 19,  fill: "var(--text-muted)", fillOp: 0.9,  candado: false },
  { nombre: "Órganos adscritos", count: 67,  fill: "var(--text-muted)", fillOp: 0.6,  candado: false },
  { nombre: "Autónomas",         count: 36,  fill: "var(--accent)",     fillOp: 0.85, candado: true  },
  { nombre: "Empresas públicas", count: 22,  fill: "var(--accent)",     fillOp: 0.45, candado: true  },
  { nombre: "Municipalidades",   count: 82,  fill: "var(--text-muted)", fillOp: 0.4,  candado: false },
  { nombre: "Otras",             count: 106, fill: "var(--text-muted)", fillOp: 0.25, candado: false },
];

const PRE_CANDADO = (CATS[0].count + CATS[1].count) / TOTAL * 100;
const CANDADO_W   = (CATS[2].count + CATS[3].count) / TOTAL * 100;

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
  border: "1px solid var(--viz-tooltip-border)", borderRadius: 6,
  padding: "8px 12px", boxShadow: "var(--viz-tooltip-shadow)",
  backdropFilter: "var(--viz-tooltip-backdrop)",
  WebkitBackdropFilter: "var(--viz-tooltip-backdrop)",
  pointerEvents: "none", minWidth: 130, zIndex: 10,
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

  return (
    <section style={sectionStyle}>
      <div style={panelStyle} ref={wrapRef} onMouseLeave={() => { setHovered(null); setTooltip(null); }}>

        {/* Annotation bracket above candado segments */}
        <div style={{
          position: "relative",
          marginBottom: 8,
          height: 36,
          opacity: animated ? 1 : 0,
          transition: "opacity 0.5s ease 0.6s",
        }}>
          <div style={{
            position: "absolute",
            left:     `${PRE_CANDADO}%`,
            width:    `${CANDADO_W}%`,
            bottom:   0,
          }}>
            {/* Horizontal bracket line */}
            <div style={{
              position:   "absolute",
              bottom:     0,
              left:       0, right: 0,
              height:     1.5,
              background: "var(--accent)",
              opacity:    0.7,
            }} />
            {/* Left tick */}
            <div style={{ position: "absolute", bottom: 0, left: 0, width: 1.5, height: 7, background: "var(--accent)", opacity: 0.7 }} />
            {/* Right tick */}
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 1.5, height: 7, background: "var(--accent)", opacity: 0.7 }} />
            {/* Label centered */}
            <div style={{
              position:      "absolute",
              bottom:        9,
              left:          "50%",
              transform:     "translateX(-50%)",
              whiteSpace:    "nowrap",
              ...TXT,
              fontSize:      11,
              fontWeight:    600,
              color:         "var(--accent)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}>
              ~58 entidades · candado constitucional · 60–70% del gasto
            </div>
          </div>
        </div>

        {/* Stacked bar */}
        <div style={{
          display:      "flex",
          gap:          1,
          height:       48,
          borderRadius: 8,
          overflow:     "hidden",
          width:        "100%",
        }}>
          {CATS.map((cat, i) => (
            <div
              key={cat.nombre}
              onMouseEnter={(e) => handleEnter(e, i)}
              onMouseMove={(e) => handleEnter(e, i)}
              onMouseLeave={() => { setHovered(null); setTooltip(null); }}
              style={{
                flex:       `${cat.count} 0 0`,
                minWidth:   0,
                background: cat.fill,
                opacity:    animated
                  ? (hovered === null ? cat.fillOp : hovered === i ? Math.min(cat.fillOp * 1.5, 1) : cat.fillOp * 0.5)
                  : 0,
                transition: "opacity 0.6s ease",
                cursor:     "default",
              }}
            />
          ))}
        </div>

        {/* Legend */}
        <div style={{
          display:   "flex",
          flexWrap:  "wrap",
          gap:       "10px 16px",
          marginTop: 16,
          opacity:   animated ? 1 : 0,
          transition:"opacity 0.5s ease 0.4s",
        }}>
          {CATS.map((cat, i) => (
            <div key={cat.nombre}
              style={{ display: "flex", alignItems: "center", gap: 6, cursor: "default" }}
              onMouseEnter={(e) => handleEnter(e, i)}
              onMouseLeave={() => { setHovered(null); setTooltip(null); }}
            >
              <span style={{
                width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                background: cat.fill, opacity: cat.fillOp,
              }} />
              <span style={{ ...TXT, fontSize: 11, color: "var(--text-muted)" }}>
                {cat.nombre}
              </span>
              <span style={{ ...TXT, fontSize: 11, fontWeight: 700, color: "var(--text)" }}>
                {cat.count}
              </span>
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {tooltip && hovered !== null && (
          <div style={{
            ...tooltipStyle,
            left: `${tooltip.x + (tooltip.right ? -150 : 14)}px`,
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
            {CATS[hovered].candado && (
              <div style={{ ...TXT, fontSize: 10, color: "var(--accent)", marginTop: 6 }}>
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
