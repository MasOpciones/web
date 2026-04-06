import React, { useEffect, useRef, useState, useCallback } from "react";

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

const BADGE_LABEL = { fallida: "sin reforma estructural", parcial: "parcial" };

const CARD_W   = 240;
const CARD_GAP = 20;

const TXT = { fontFamily: "var(--font-sans)", fontVariantNumeric: "tabular-nums" };

const sectionStyle = {
  width: "100%",
  margin: "2.8rem 0 3.2rem",
  padding: "0.15rem 0",
  fontFamily: "var(--font-sans)",
  color: "var(--text)",
};

const panelStyle = {
  position:   "relative",
  width:      "100%",
  boxSizing:  "border-box",
  background: "var(--viz-panel)",
  borderRadius: "16px",
  padding:    "20px",
  border:     "1px solid var(--border)",
  overflow:   "hidden",
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
  maxWidth:             300,
  zIndex:               10,
};

export default function GraficoTimelineReformas() {
  const trackRef    = useRef(null);
  const panelRef    = useRef(null);
  const intervalRef = useRef(null);
  const dragRef     = useRef({ active: false, startX: 0 });

  const [mounted,   setMounted]   = useState(false);
  const [active,    setActive]    = useState(0);
  const [paused,    setPaused]    = useState(false);
  const [hovered,   setHovered]   = useState(null);

  // Tooltip state
  const [tipData,  setTipData]  = useState(null);
  const [tipPos,   setTipPos]   = useState({ x: 0, y: 0, right: false });

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setMounted(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  // Auto-advance
  const advance = useCallback(() => {
    setActive((prev) => (prev + 1) % REFORMAS.length);
  }, []);

  useEffect(() => {
    if (paused) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(advance, 3500);
    return () => clearInterval(intervalRef.current);
  }, [paused, advance]);

  // Compute translateX so active card is roughly centred in the visible track
  function getTranslate() {
    if (!trackRef.current) return 0;
    const panelW  = trackRef.current.parentElement?.offsetWidth ?? 600;
    const offset  = active * (CARD_W + CARD_GAP);
    const center  = panelW / 2 - CARD_W / 2;
    return Math.min(0, -(offset - center));
  }

  // Drag handling
  function onMouseDown(e) {
    dragRef.current = { active: true, startX: e.clientX };
    setPaused(true);
  }
  function onMouseMove(e) {
    if (!dragRef.current.active) return;
    const delta = dragRef.current.startX - e.clientX;
    if (Math.abs(delta) > 40) {
      dragRef.current.active = false;
      setActive((prev) =>
        delta > 0
          ? Math.min(prev + 1, REFORMAS.length - 1)
          : Math.max(prev - 1, 0)
      );
    }
  }
  function onMouseUp() {
    dragRef.current.active = false;
    setPaused(false);
  }

  function handleCardMouseEnter(e, i) {
    setHovered(i);
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    setTipData(REFORMAS[i]);
    setTipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      right: e.clientX - rect.left > rect.width / 2,
    });
  }
  function handleCardMouseMove(e, i) {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    setTipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      right: e.clientX - rect.left > rect.width / 2,
    });
  }
  function handleCardMouseLeave() {
    setHovered(null);
    setTipData(null);
  }

  const translateX = getTranslate();

  return (
    <section style={sectionStyle}>
      <div
        style={{ ...panelStyle, position: "relative" }}
        ref={panelRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => { setPaused(false); setHovered(null); setTipData(null); }}
      >
        {/* Arrow buttons */}
        <div style={{
          position: "absolute", top: 18, right: 18,
          display: "flex", gap: 4, zIndex: 2,
        }}>
          <button
            onClick={() => setActive((p) => Math.max(p - 1, 0))}
            style={{
              ...TXT, fontSize: 18, color: "var(--text-muted)",
              background: "none", border: "none", cursor: "pointer",
              lineHeight: 1, padding: "2px 6px", opacity: active === 0 ? 0.3 : 0.7,
            }}
            aria-label="Anterior"
          >←</button>
          <button
            onClick={() => setActive((p) => Math.min(p + 1, REFORMAS.length - 1))}
            style={{
              ...TXT, fontSize: 18, color: "var(--text-muted)",
              background: "none", border: "none", cursor: "pointer",
              lineHeight: 1, padding: "2px 6px",
              opacity: active === REFORMAS.length - 1 ? 0.3 : 0.7,
            }}
            aria-label="Siguiente"
          >→</button>
        </div>

        {/* Carousel track wrapper */}
        <div
          style={{ overflow: "hidden", cursor: "grab", userSelect: "none" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          ref={trackRef}
        >
          <div style={{
            display:    "flex",
            gap:        CARD_GAP,
            transform:  `translateX(${translateX}px)`,
            transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
            willChange: "transform",
          }}>
            {REFORMAS.map((r, i) => {
              const isActive = i === active;
              const isHov    = hovered === i;
              const delay    = `${i * 0.06}s`;

              return (
                <div
                  key={r.año}
                  style={{
                    width:        CARD_W,
                    flexShrink:   0,
                    borderRadius: 12,
                    padding:      "18px 16px",
                    border:       isActive
                      ? "1px solid rgba(96,255,18,0.4)"
                      : isHov
                        ? "1px solid rgba(96,255,18,0.3)"
                        : "1px solid var(--border)",
                    background:   isHov ? "rgba(96,255,18,0.03)" : "transparent",
                    transition:   "border-color 0.2s ease, background 0.2s ease",
                    opacity:      mounted ? 1 : 0,
                    transform:    mounted ? "translateY(0)" : "translateY(10px)",
                    // stagger only on mount, not on every re-render
                  }}
                  onMouseEnter={(e) => handleCardMouseEnter(e, i)}
                  onMouseMove={(e)  => handleCardMouseMove(e, i)}
                  onMouseLeave={handleCardMouseLeave}
                >
                  {/* Year */}
                  <div style={{
                    ...TXT,
                    fontSize:   22,
                    fontWeight: 800,
                    color:      "var(--accent)",
                    lineHeight: 1,
                  }}>
                    {r.año}
                  </div>

                  {/* Name */}
                  <div style={{
                    ...TXT,
                    fontSize:   13,
                    fontWeight: 600,
                    color:      "var(--text)",
                    marginTop:  4,
                    lineHeight: 1.3,
                  }}>
                    {r.nombre}
                  </div>

                  {/* Badge */}
                  <div style={{
                    ...TXT,
                    fontSize:      9,
                    fontWeight:    600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color:         "var(--text-muted)",
                    opacity:       0.5,
                    marginTop:     5,
                  }}>
                    {BADGE_LABEL[r.tipo]}
                  </div>

                  {/* Description */}
                  <div style={{
                    ...TXT,
                    fontSize:   12,
                    color:      "var(--text-muted)",
                    lineHeight: 1.5,
                    marginTop:  8,
                  }}>
                    {r.descripcion}
                  </div>

                  {/* Divider */}
                  <div style={{
                    margin:     "8px 0",
                    borderTop:  "1px solid var(--border)",
                    opacity:    0.4,
                  }} />

                  {/* Resultado */}
                  <div style={{
                    ...TXT,
                    fontSize:   11,
                    color:      "var(--text-muted)",
                    lineHeight: 1.45,
                  }}>
                    {r.resultado}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dot indicators */}
        <div style={{
          display:        "flex",
          justifyContent: "center",
          gap:            6,
          marginTop:      16,
        }}>
          {REFORMAS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActive(i); setPaused(true); setTimeout(() => setPaused(false), 5000); }}
              style={{
                width:        i === active ? 16 : 5,
                height:       5,
                borderRadius: 999,
                background:   i === active ? "var(--accent)" : "var(--border)",
                border:       "none",
                padding:      0,
                cursor:       "pointer",
                transition:   "background 0.2s ease, width 0.3s ease",
              }}
              aria-label={`Ir a ${REFORMAS[i].año}`}
            />
          ))}
        </div>

        {/* Bottom callout */}
        <div style={{
          marginTop:  16,
          paddingTop: 14,
          borderTop:  "1px solid var(--border)",
          ...TXT,
          fontSize:   13,
          lineHeight: 1.55,
          color:      "var(--text-muted)",
          opacity:    mounted ? 1 : 0,
          transition: "opacity 0.45s ease 0.5s",
        }}>
          El patrón se repite en cada intento: diagnóstico, comisión, propuesta,{" "}
          <strong style={{ color: "var(--accent)", fontWeight: 700 }}>archivo</strong>.
          Costa Rica ha tenido más comisiones de reforma que países con reformas reales.
        </div>

        {/* Tooltip */}
        {tipData && (
          <div style={{
            ...tooltipStyle,
            left: tipPos.right ? `${tipPos.x - 316}px` : `${tipPos.x + 16}px`,
            top:  `${tipPos.y - 10}px`,
          }}>
            <div style={{ ...TXT, fontSize: 11, color: "var(--text-muted)", marginBottom: 6,
              fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {tipData.año} · {tipData.nombre}
            </div>
            <p style={{ margin: "0 0 8px", ...TXT, fontSize: 12.5, lineHeight: 1.5, color: "var(--text-muted)" }}>
              {tipData.descripcion}
            </p>
            <p style={{ margin: 0, ...TXT, fontSize: 12, lineHeight: 1.5, color: "var(--text-muted)" }}>
              {tipData.resultado}
            </p>
          </div>
        )}
      </div>

      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 10, fontSize: 10, textTransform: "uppercase",
        color: "var(--text-muted)", ...TXT, letterSpacing: "0.04em",
      }}>
        <span>FUENTE: MIDEPLAN, CGR, Asamblea Legislativa</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
