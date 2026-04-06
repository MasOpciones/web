import React, { useEffect, useState } from "react";

// 9 sectors × N institutions each — dot matrix
const SECTORS = [
  { nombre: "Salud",               count: 14, highlight: true  },
  { nombre: "Educación",           count: 12, highlight: true  },
  { nombre: "Seguridad social",    count: 11, highlight: false },
  { nombre: "Agropecuario",        count: 18, highlight: true  },
  { nombre: "Infraestructura",     count: 9,  highlight: false },
  { nombre: "Vivienda",            count: 8,  highlight: false },
  { nombre: "Cultura y deporte",   count: 7,  highlight: false },
  { nombre: "Medio ambiente",      count: 10, highlight: true  },
  { nombre: "Economía y comercio", count: 11, highlight: false },
];

const TOTAL_DOTS = SECTORS.reduce((s, r) => s + r.count, 0);

const TXT = { fontFamily: "var(--font-sans)", fontVariantNumeric: "tabular-nums" };

const sectionStyle = {
  width: "100%", margin: "2.8rem 0 3.2rem", padding: "0.15rem 0",
  fontFamily: "var(--font-sans)", color: "var(--text)",
};

const panelStyle = {
  position: "relative", width: "100%", overflow: "visible",
  background:
    "radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 8%, transparent), transparent 36%), " +
    "linear-gradient(160deg, var(--viz-panel-strong) 0%, var(--viz-panel) 100%)",
  borderRadius: "16px", padding: "24px 20px 20px",
  border: "1px solid var(--border)", boxShadow: "var(--viz-shadow)",
};

const tooltipStyle = {
  position: "absolute", background: "var(--viz-tooltip-bg)",
  border: "1px solid var(--viz-tooltip-border)", borderRadius: 8,
  padding: "10px 14px", boxShadow: "var(--viz-tooltip-shadow)",
  backdropFilter: "var(--viz-tooltip-backdrop)",
  WebkitBackdropFilter: "var(--viz-tooltip-backdrop)",
  pointerEvents: "none", minWidth: 180, zIndex: 10,
};

// Descriptions for tooltip
const SECTOR_DESC = {
  "Salud":               "CCSS, MTSS, IAFA, INS, hospitales nacionales — 14 entidades con competencias superpuestas",
  "Educación":           "MEP, CONARE, UCR, TEC, UNA, UNED, institutos técnicos — sin coordinación presupuestaria",
  "Seguridad social":    "CCSS, IMAS, FODESAF, Patronato Nacional — transferencias duplicadas a beneficiarios comunes",
  "Agropecuario":        "MAG, INTA, CNP, SENASA, INCOPESCA, DINADECO — 18 entidades, mayor densidad institucional",
  "Infraestructura":     "MOPT, COSEVI, CONAVI, AyA, ICE, RECOPE — planificación fragmentada",
  "Vivienda":            "MIVAH, BANHVI, INVU, municipalidades — subsidios sin ventanilla única",
  "Cultura y deporte":   "MCJ, DINADECO, ICODER, SINAC — 7 entidades, presupuestos dispersos",
  "Medio ambiente":      "MINAE, SINAC, SETENA, CONAGEBIO, FONAFIFO — 10 entidades, competencias trasladas",
  "Economía y comercio": "MEIC, PROCOMER, COMEX, BCCR, SUGEF — regulación financiera fragmentada",
};

export default function GraficoDuplicidades() {
  const [animated, setAnimated] = useState(false);
  const [hovered,  setHovered]  = useState(null);
  const [tipPos,   setTipPos]   = useState({ x: 0, y: 0, right: false });
  const panelRef  = React.useRef(null);

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
      right: e.clientX - rect.left > rect.width / 2,
    });
  }

  return (
    <section style={sectionStyle}>
      <div style={panelStyle} ref={panelRef} onMouseLeave={() => setHovered(null)}>

        {/* Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {SECTORS.map((sector, si) => {
            const isHov  = hovered === si;
            const delay  = `${si * 0.06}s`;

            return (
              <div
                key={sector.nombre}
                style={{
                  display:    "flex",
                  alignItems: "center",
                  gap:        10,
                  padding:    "7px 10px",
                  borderRadius: 8,
                  cursor:     "default",
                  background: isHov ? "rgba(255,255,255,0.04)" : "transparent",
                  border:     isHov
                    ? "1px solid rgba(96,255,18,0.18)"
                    : "1px solid transparent",
                  opacity:    animated ? 1 : 0,
                  transform:  animated ? "translateX(0)" : "translateX(-10px)",
                  transition: `opacity 0.4s ease ${delay}, transform 0.4s ease ${delay}, background 0.2s ease, border-color 0.2s ease`,
                }}
                onMouseMove={(e) => handleMove(e, si)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Sector label */}
                <span style={{
                  ...TXT,
                  fontSize:   12,
                  fontWeight: isHov ? 600 : 400,
                  color:      isHov ? "var(--text)" : "var(--text-muted)",
                  width:      148,
                  flexShrink: 0,
                  transition: "color 0.2s ease, font-weight 0.2s ease",
                }}>
                  {sector.nombre}
                </span>

                {/* Dot row */}
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", flex: 1 }}>
                  {Array.from({ length: sector.count }).map((_, di) => {
                    const dotDelay = `${si * 0.06 + di * 0.018}s`;
                    const isAccent = sector.highlight;
                    return (
                      <div
                        key={di}
                        style={{
                          width:        9,
                          height:       9,
                          borderRadius: "50%",
                          flexShrink:   0,
                          background:   isAccent
                            ? (isHov ? "var(--accent)" : "rgba(96,255,18,0.45)")
                            : (isHov ? "var(--text-muted)" : "rgba(156,163,175,0.35)"),
                          boxShadow:    isHov && isAccent ? "0 0 5px rgba(96,255,18,0.4)" : "none",
                          opacity:      animated ? 1 : 0,
                          transition:   `opacity 0.3s ease ${dotDelay}, background 0.2s ease, box-shadow 0.2s ease`,
                        }}
                      />
                    );
                  })}
                </div>

                {/* Count */}
                <span style={{
                  ...TXT,
                  fontSize:   12,
                  fontWeight: 700,
                  color:      isHov
                    ? (sector.highlight ? "var(--accent)" : "var(--text-muted)")
                    : "var(--text-muted)",
                  opacity:    isHov ? 1 : 0.6,
                  width:      24,
                  textAlign:  "right",
                  flexShrink: 0,
                  transition: "color 0.2s ease, opacity 0.2s ease",
                }}>
                  {sector.count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Callout */}
        <div style={{
          marginTop:  20,
          paddingTop: 14,
          borderTop:  "1px solid var(--border)",
          display:    "flex",
          gap:        20,
          flexWrap:   "wrap",
          opacity:    animated ? 1 : 0,
          transition: "opacity 0.5s ease 0.7s",
        }}>
          <div>
            <span style={{ ...TXT, fontSize: 22, fontWeight: 800, color: "var(--accent)" }}>
              {TOTAL_DOTS}
            </span>
            <span style={{ ...TXT, fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>
              entidades analizadas
            </span>
          </div>
          <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 20 }}>
            <span style={{ ...TXT, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
              67 órganos adscritos sin personalidad jurídica propia — creados por decreto,{" "}
              <strong style={{ color: "var(--text)" }}>suprimibles sin reforma constitucional</strong>
            </span>
          </div>
        </div>

        {/* Tooltip */}
        {hovered !== null && (
          <div style={{
            ...tooltipStyle,
            left: tipPos.right ? `${tipPos.x - 200}px` : `${tipPos.x + 16}px`,
            top:  `${tipPos.y - 10}px`,
          }}>
            <div style={{ ...TXT, fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 5 }}>
              {SECTORS[hovered].nombre}
              <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>
                {SECTORS[hovered].count} entidades
              </span>
            </div>
            <div style={{ ...TXT, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
              {SECTOR_DESC[SECTORS[hovered].nombre]}
            </div>
          </div>
        )}
      </div>

      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 10, fontSize: 10, textTransform: "uppercase",
        color: "var(--text-muted)", ...TXT, letterSpacing: "0.04em",
      }}>
        <span>FUENTE: CGR — Diagnóstico sectorial 2022 · MIDEPLAN</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
