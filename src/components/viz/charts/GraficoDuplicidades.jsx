import React, { useEffect, useState } from "react";

const SECTORES = [
  { nombre: "Agropecuario",            instituciones: ["MAG", "CNP", "INDER", "PIMA", "INTA"] },
  { nombre: "Protección social",        instituciones: ["CCSS", "IMAS", "PANI", "CONAPAM", "JPS", "CONAPDIS", "CEN-CINAI"] },
  { nombre: "Pensiones",                instituciones: ["IVM-CCSS", "Poder Judicial", "MEP", "Hacienda"] },
  { nombre: "Educación y formación",    instituciones: ["MEP", "INA", "CONAPE"] },
  { nombre: "Vivienda",                 instituciones: ["MIVAH", "INVU", "BANHVI"] },
  { nombre: "Energía",                  instituciones: ["ICE", "Empresas municipales", "Cooperativas"] },
  { nombre: "Movilidad",                instituciones: ["MOPT", "CONAVI", "CTP"] },
  { nombre: "Ambiente",                 instituciones: ["SETENA", "Comisiones sectoriales"] },
  { nombre: "Ordenamiento territorial", instituciones: ["INVU", "MIDEPLAN", "ICT"] },
];

const TOTAL_INST = SECTORES.reduce((s, r) => s + r.instituciones.length, 0);

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

export default function GraficoDuplicidades() {
  const [animated, setAnimated] = useState(false);
  const [hovered,  setHovered]  = useState(null);

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimated(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section style={sectionStyle}>
      <div style={panelStyle}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {SECTORES.map((sector, i) => {
            const isHov   = hovered === i;
            const isLast  = i === SECTORES.length - 1;
            const maxInst = Math.max(...SECTORES.map((s) => s.instituciones.length));
            const isMax   = sector.instituciones.length === maxInst;
            const delay   = `${i * 0.05}s`;

            return (
              <div
                key={sector.nombre}
                style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          12,
                  padding:      "9px 8px",
                  borderRadius: 6,
                  borderBottom: isLast ? "none" : "1px solid var(--border)",
                  background:   isHov ? "rgba(255,255,255,0.02)" : "transparent",
                  cursor:       "default",
                  opacity:      animated ? 1 : 0,
                  transform:    animated ? "translateX(0)" : "translateX(-8px)",
                  transition:   `opacity 0.4s ease ${delay}, transform 0.4s ease ${delay}, background 0.15s ease`,
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Sector name */}
                <span style={{
                  ...TXT,
                  fontSize:   12,
                  fontWeight: 600,
                  color:      isHov ? "var(--text)" : "var(--text-muted)",
                  width:      140,
                  flexShrink: 0,
                  lineHeight: 1.3,
                  transition: "color 0.15s ease",
                }}>
                  {sector.nombre}
                </span>

                {/* Institution tags */}
                <span style={{
                  ...TXT,
                  fontSize:   11,
                  color:      "var(--text-muted)",
                  flex:       1,
                  lineHeight: 1.5,
                }}>
                  {sector.instituciones.join(" · ")}
                </span>

                {/* Count */}
                <span style={{
                  ...TXT,
                  fontSize:   11,
                  fontWeight: 700,
                  color:      isMax ? "var(--accent)" : "var(--text-muted)",
                  opacity:    isMax ? 1 : 0.6,
                  width:      16,
                  textAlign:  "right",
                  flexShrink: 0,
                }}>
                  {sector.instituciones.length}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer totals */}
        <div style={{
          ...TXT,
          marginTop:  16,
          paddingTop: 12,
          borderTop:  "1px solid var(--border)",
          fontSize:   11,
          color:      "var(--text-muted)",
          opacity:    animated ? 1 : 0,
          transition: "opacity 0.5s ease 0.55s",
        }}>
          9 sectores · {TOTAL_INST} instituciones con mandatos superpuestos
        </div>
      </div>

      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 10, fontSize: 10, textTransform: "uppercase",
        color: "var(--text-muted)", ...TXT, letterSpacing: "0.04em",
      }}>
        <span>FUENTE: CGR — Diagnóstico sectorial, Comisión Legislativa de Reforma, julio 2022</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
