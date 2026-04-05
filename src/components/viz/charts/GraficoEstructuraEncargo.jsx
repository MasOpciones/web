import React, { useEffect, useState } from "react";

const ENCARGO = {
  capa1: {
    numero: "Capa 1",
    nombre: "Spending review independiente",
    descripcion:
      "Revisión programa a programa de qué produce resultados medibles. Con ancla de credibilidad externa — el elemento que distingue los casos exitosos.",
    ejemplos: ["Jamaica 2013–2019", "Australia MYEFO", "Reino Unido Spending Review"],
  },
  capa2: {
    numero: "Capa 2",
    nombre: "Auditoría forense operacional",
    descripcion:
      "Lo que nunca se ha hecho. No una revisión de eficiencia — una auditoría con metodología forense de lo que hay adentro del aparato.",
    pilares: [
      {
        numero: "Pilar 1",
        nombre: "Auditoría de nómina y funciones",
        detalle:
          "309,208 empleados en 19 regímenes. Plazas que cobran sin cotizar correctamente. Duplicidad de funciones entre instituciones.",
      },
      {
        numero: "Pilar 2",
        nombre: "Auditoría de compras públicas",
        detalle:
          "Contratos de los últimos 10 años. Patrones estadísticos: proveedores bajo umbrales de licitación, pliegos diseñados, contratos fraccionados.",
      },
      {
        numero: "Pilar 3",
        nombre: "Mapa de estructura institucional",
        detalle:
          "Con datos de los dos pilares anteriores: qué fusionar, qué cerrar, en qué secuencia. Qué requiere mayoría simple vs dos tercios vs reforma constitucional.",
      },
    ],
  },
};

const TXT    = { fontFamily: "var(--font-sans)" };
const ACCENT = "var(--accent)";

const sectionStyle = {
  width:      "100%",
  margin:     "2.8rem 0 3.2rem",
  padding:    "0.15rem 0",
  fontFamily: "var(--font-sans)",
  color:      "var(--text)",
};

const capaStyle = {
  border:       "1px solid var(--border)",
  borderRadius: 12,
  padding:      "20px",
  background:   "var(--viz-panel)",
};

export default function GraficoEstructuraEncargo() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setMounted(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  function fade(delay) {
    return {
      opacity:    mounted ? 1 : 0,
      transform:  mounted ? "translateY(0)" : "translateY(12px)",
      transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
    };
  }

  return (
    <section style={sectionStyle}>

      {/* ── CAPA 1 ── */}
      <div style={{ ...capaStyle, ...fade(0) }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ ...TXT, fontSize: 10, fontWeight: 500, color: "var(--text-muted)" }}>
            {ENCARGO.capa1.numero}
          </span>
          <h4 style={{ margin: 0, ...TXT, fontSize: "clamp(1rem, 2.4vw, 1.2rem)",
            fontWeight: 700, color: "var(--text)" }}>
            {ENCARGO.capa1.nombre}
          </h4>
          {/* Badge — condición previa */}
          <span style={{
            ...TXT,
            fontSize:      9,
            fontWeight:    600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color:         "var(--text-muted)",
            border:        "1px solid var(--border)",
            borderRadius:  4,
            padding:       "2px 7px",
            lineHeight:    1.6,
          }}>
            condición previa
          </span>
        </div>

        <p style={{ margin: "0 0 12px", ...TXT, fontSize: 13, lineHeight: 1.6, color: "var(--text-muted)" }}>
          {ENCARGO.capa1.descripcion}
        </p>

        {/* Casos de referencia — texto plano con · */}
        <p style={{ margin: 0, ...TXT, fontSize: 11, color: "var(--text-muted)" }}>
          <span style={{ marginRight: 6 }}>Casos de referencia:</span>
          {ENCARGO.capa1.ejemplos.join(" · ")}
        </p>
      </div>

      {/* ── Conector ── */}
      <div style={{
        ...fade(0.2),
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        gap:           4,
        padding:       "6px 0",
        pointerEvents: "none",
      }}>
        <div style={{ width: 1, height: 24, background: "var(--border)" }} />
        <span style={{
          ...TXT, fontSize: 9, color: "var(--text-muted)",
          letterSpacing: "0.06em", textTransform: "uppercase",
          opacity: 0.5,
        }}>
          alimenta
        </span>
      </div>

      {/* ── CAPA 2 ── */}
      <div style={{ ...capaStyle, ...fade(0.35) }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ ...TXT, fontSize: 10, fontWeight: 500, color: "var(--text-muted)" }}>
            {ENCARGO.capa2.numero}
          </span>
          <h4 style={{ margin: 0, ...TXT, fontSize: "clamp(1rem, 2.4vw, 1.2rem)",
            fontWeight: 700, color: "var(--text)" }}>
            {ENCARGO.capa2.nombre}
          </h4>
          {/* Badge — nunca se ha hecho, único uso de accent */}
          <span style={{
            ...TXT,
            fontSize:      9,
            fontWeight:    600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color:         ACCENT,
            background:    "transparent",
            border:        "none",
            padding:       "2px 0",
            lineHeight:    1.6,
          }}>
            nunca se ha hecho
          </span>
        </div>

        <p style={{ margin: "0 0 18px", ...TXT, fontSize: 13, lineHeight: 1.6, color: "var(--text-muted)" }}>
          {ENCARGO.capa2.descripcion}
        </p>

        {/* Pilares */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {ENCARGO.capa2.pilares.map((pilar, i) => (
            <div
              key={pilar.numero}
              style={{
                ...fade(0.5 + i * 0.12),
                flex:         "1 1 200px",
                background:   "rgba(255,255,255,0.02)",
                border:       "1px solid var(--border)",
                borderRadius: 10,
                padding:      "12px 14px",
              }}
            >
              <p style={{
                margin: "0 0 4px", ...TXT,
                fontSize: 10, fontWeight: 500,
                color: "var(--text-muted)",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
              }}>
                {pilar.numero}
              </p>
              <p style={{
                margin: "0 0 8px", ...TXT,
                fontSize: 13, fontWeight: 600,
                color: "var(--text)", lineHeight: 1.3,
              }}>
                {pilar.nombre}
              </p>
              <p style={{
                margin: 0, ...TXT,
                fontSize: 12, lineHeight: 1.55,
                color: "var(--text-muted)",
              }}>
                {pilar.detalle}
              </p>
            </div>
          ))}
        </div>

        {/* Nota al pie */}
        <p style={{
          margin: "16px 0 0", ...TXT,
          fontSize: 11, lineHeight: 1.5,
          color: "var(--text-muted)", fontStyle: "italic",
        }}>
          Los Pilares 1 y 2 son insumos para el Pilar 3. El mapa no se puede hacer sin los datos —
          y sin el mapa, cualquier propuesta de fusión es política, no técnica.
        </p>
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
        ...TXT,
        fontVariantNumeric: "tabular-nums",
        letterSpacing:      "0.04em",
      }}>
        <span>FUENTE: Elaboración propia · MásOpciones 2025</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
