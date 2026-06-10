import React, { useEffect, useState } from "react";

const HITOS = [
  {
    año: 1950,
    titulo: "Último viaje del tranvía",
    desc: "51 años de servicio. La red peatonal y de transporte público que estructuraba el centro deja de existir.",
    tipo: "quiebre",
  },
  {
    año: 1973,
    titulo: "Primer centro comercial",
    desc: "Centro Comercial Guadalupe. Formato modesto, aún sin el modelo de mall cerrado.",
    tipo: "mall",
  },
  {
    año: 1982,
    titulo: "Primer formato cerrado",
    desc: "Plaza del Sol / Plaza Mayor. Precursor del modelo de retail climatizado.",
    tipo: "mall",
  },
  {
    año: 1993,
    titulo: "Multiplaza Escazú",
    desc: "Primer mall moderno del país. Cerrado, climatizado, con estacionamiento masivo, orientado completamente al acceso en automóvil. Punto de quiebre.",
    tipo: "quiebre",
  },
  {
    año: 1994,
    titulo: "Mall San Pedro",
    desc: "Segundo mall moderno. El modelo se consolida en el corredor este del GAM.",
    tipo: "mall",
  },
  {
    año: 2008,
    titulo: "8,726 empresas en el cantón central",
    desc: "Primer año con datos del DEE del INEC. El punto de partida de la serie documentada.",
    tipo: "dato",
  },
  {
    año: 2022,
    titulo: "4,571 empresas — mínimo histórico",
    desc: "El cantón central perdió el 47.6% de sus empresas en 14 años. Hospital cayó un 61.7%.",
    tipo: "quiebre",
  },
];

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
  background: "color-mix(in srgb, var(--viz-panel) 60%, black)",
  borderRadius: "16px",
  padding: "20px",
  border: "1px solid var(--border)",
  boxShadow: "var(--viz-shadow)",
};

const TIPO_COLOR = {
  quiebre: "var(--accent)",
  mall: "var(--text-muted)",
  dato: "var(--text-muted)",
};

const TIPO_OPACITY = {
  quiebre: 1,
  mall: 0.5,
  dato: 0.5,
};

const TIPO_SIZE = {
  quiebre: 10,
  mall: 8,
  dato: 8,
};

export default function GraficoTimelineMalls() {
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
          display: "flex", gap: 20, marginBottom: 20,
          opacity: animated ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
            <span style={{ ...TXT, fontSize: 12, color: "var(--text)" }}>Puntos de quiebre</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-muted)", opacity: 0.5 }} />
            <span style={{ ...TXT, fontSize: 12, color: "var(--text-muted)" }}>Nuevos malls</span>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ position: "relative", paddingLeft: 28 }}>

          {/* Vertical line */}
          <div style={{
            position: "absolute",
            left: 7,
            top: 0,
            bottom: 0,
            width: 1,
            background: "var(--border)",
            opacity: animated ? 0.25 : 0,
            transition: "opacity 0.5s ease",
          }} />

          {HITOS.map((h, i) => {
            const isHov = hovered === i;
            const isLast = i === HITOS.length - 1;
            const delay = `${i * 0.08}s`;
            const color = TIPO_COLOR[h.tipo];
            const dotOpacity = TIPO_OPACITY[h.tipo];

            const size = TIPO_SIZE[h.tipo];

            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  paddingBottom: isLast ? 0 : 28,
                  opacity: animated ? 1 : 0,
                  transform: animated ? "translateX(0)" : "translateX(-8px)",
                  transition: `opacity 0.4s ease ${delay}, transform 0.4s ease ${delay}`,
                  cursor: "default",
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Dot */}
                <div style={{
                  position: "absolute",
                  left: -21,
                  top: 8,
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  background: color,
                  opacity: isHov ? Math.min(dotOpacity * 1.8, 1) : dotOpacity,
                  transition: "opacity 0.15s ease, transform 0.15s ease",
                  transform: isHov ? "scale(1.3)" : "scale(1)",
                }} />

                {/* Content */}
                <div style={{
                  background: isHov ? "rgba(255,255,255,0.03)" : "transparent",
                  borderRadius: 8,
                  padding: isHov ? "10px 12px" : "4px 0",
                  marginLeft: -12,
                  paddingLeft: isHov ? 12 : 0,
                  transition: "background 0.15s ease, padding 0.15s ease",
                }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 3 }}>
                    <span style={{
                      ...TXT,
                      fontSize: 12,
                      fontWeight: h.tipo === "quiebre" ? 700 : 500,
                      color: color,
                      flexShrink: 0,
                      letterSpacing: "0.04em",
                    }}>
                      {h.año}
                    </span>
                    <span style={{
                      ...TXT,
                      fontSize: h.tipo === "quiebre" ? 15 : 14,
                      fontWeight: h.tipo === "quiebre" ? 600 : 400,
                      color: isHov ? "var(--text)" : h.tipo === "quiebre" ? "var(--text)" : "var(--text-muted)",
                      transition: "color 0.15s ease",
                      lineHeight: 1.3,
                    }}>
                      {h.titulo}
                    </span>
                  </div>

                  {(isHov || h.tipo === "quiebre") && (
                    <p style={{
                      ...TXT,
                      fontSize: 13,
                      color: "var(--text-muted)",
                      margin: 0,
                      lineHeight: 1.6,
                      maxWidth: 480,
                    }}>
                      {h.desc}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: "1px solid var(--border)",
          opacity: animated ? 1 : 0,
          transition: "opacity 0.5s ease 0.6s",
        }}>
          <span style={{ ...TXT, fontSize: 11, color: "var(--text-muted)", opacity: 0.45, fontStyle: "italic" }}>
            Pasá el cursor sobre cada hito para ver el detalle.
          </span>
        </div>
      </div>

      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 10, fontSize: 10, textTransform: "uppercase",
        color: "var(--text-muted)", ...TXT, letterSpacing: "0.04em",
      }}>
        <span>FUENTE: EL FINANCIERO CR · MICOSTARICADEANTANO · INEC DEE 2008–2024</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
