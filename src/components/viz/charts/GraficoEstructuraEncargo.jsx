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
const ACCENT = "#60ff12";

const sectionStyle = {
  width: "100%",
  margin: "2.8rem 0 3.2rem",
  padding: "0.15rem 0",
  fontFamily: "var(--font-sans)",
  color: "var(--text)",
};

function Badge({ label, bg, border, color }) {
  return (
    <span style={{
      ...TXT,
      display:       "inline-block",
      fontSize:      9.5,
      fontWeight:    600,
      letterSpacing: "0.07em",
      textTransform: "uppercase",
      color,
      background:    bg,
      border:        `1px solid ${border}`,
      borderRadius:  4,
      padding:       "2px 7px",
      lineHeight:    1.6,
    }}>
      {label}
    </span>
  );
}

export default function GraficoEstructuraEncargo() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setMounted(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  function fade(delay, extra) {
    return {
      opacity:    mounted ? 1 : 0,
      transform:  mounted ? "translateY(0)" : "translateY(12px)",
      transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
      ...extra,
    };
  }

  return (
    <section style={sectionStyle}>
      {/* Header */}
      <header style={{ marginBottom: 14 }}>
        <p style={{
          margin: 0, fontSize: 11, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "var(--text-muted)",
          fontWeight: 700, ...TXT,
        }}>
          ACTO V · ESTRUCTURA DEL ENCARGO
        </p>
        <h3 style={{
          fontSize: "clamp(1.3rem, 2.8vw, 1.9rem)", fontWeight: 800,
          lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--text)",
          margin: "4px 0 6px", ...TXT,
        }}>
          El encargo en dos capas
        </h3>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, ...TXT }}>
          Spending review + auditoría forense operacional — la combinación que no se ha intentado
        </p>
      </header>

      {/* ── CAPA 1 ── */}
      <div style={{
        ...fade(0),
        borderLeft:   "4px solid rgba(59,130,246,0.55)",
        background:   "linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(17,24,39,0.8) 100%)",
        border:       "1px solid rgba(59,130,246,0.18)",
        borderLeftWidth: 4,
        borderLeftColor: "rgba(59,130,246,0.55)",
        borderRadius: "0 12px 12px 0",
        padding:      "18px 20px",
        marginBottom: 0,
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ ...TXT, fontSize: 10, fontWeight: 700, color: "#93c5fd",
            letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {ENCARGO.capa1.numero}
          </span>
          <h4 style={{ margin: 0, ...TXT, fontSize: "clamp(1rem, 2.4vw, 1.2rem)",
            fontWeight: 700, color: "var(--text)" }}>
            {ENCARGO.capa1.nombre}
          </h4>
          <Badge
            label="condición previa"
            bg="rgba(59,130,246,0.1)"
            border="rgba(59,130,246,0.3)"
            color="#93c5fd"
          />
        </div>

        <p style={{ margin: "0 0 12px", ...TXT, fontSize: 13, lineHeight: 1.6, color: "var(--text-muted)" }}>
          {ENCARGO.capa1.descripcion}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <span style={{ ...TXT, fontSize: 10, color: "#6b7280", marginRight: 4 }}>Casos de referencia:</span>
          {ENCARGO.capa1.ejemplos.map((ej) => (
            <span key={ej} style={{
              ...TXT, fontSize: 10, fontWeight: 500,
              color: "#93c5fd",
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: 4, padding: "1px 7px",
            }}>
              {ej}
            </span>
          ))}
        </div>
      </div>

      {/* ── Conector ── */}
      <div style={{
        ...fade(0.2),
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "flex-start",
        paddingLeft:    28,
        margin:         "0",
        gap:            0,
        pointerEvents:  "none",
      }}>
        {/* Vertical stem */}
        <div style={{ width: 2, height: 12, background: "#374151" }} />
        {/* Arrow head */}
        <svg width={14} height={10} style={{ display: "block", marginLeft: -6 }}>
          <path d="M7 10 L0 0 L14 0 Z" fill="#374151" />
        </svg>
        {/* Label */}
        <span style={{
          ...TXT, fontSize: 9.5, color: "#4b5563",
          letterSpacing: "0.06em", textTransform: "uppercase",
          marginTop: 4, marginLeft: -12,
        }}>
          alimenta
        </span>
      </div>

      {/* ── CAPA 2 ── */}
      <div style={{
        ...fade(0.35),
        borderLeft:      "4px solid rgba(96,255,18,0.7)",
        background:      "linear-gradient(135deg, rgba(96,255,18,0.05) 0%, rgba(11,11,11,0.9) 100%)",
        border:          "1px solid rgba(96,255,18,0.18)",
        borderLeftWidth: 4,
        borderLeftColor: "rgba(96,255,18,0.7)",
        borderRadius:    "0 12px 12px 0",
        padding:         "18px 20px 20px",
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ ...TXT, fontSize: 10, fontWeight: 700, color: ACCENT,
            letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {ENCARGO.capa2.numero}
          </span>
          <h4 style={{ margin: 0, ...TXT, fontSize: "clamp(1rem, 2.4vw, 1.2rem)",
            fontWeight: 700, color: "var(--text)" }}>
            {ENCARGO.capa2.nombre}
          </h4>
          <Badge
            label="nunca se ha hecho"
            bg="rgba(96,255,18,0.08)"
            border="rgba(96,255,18,0.28)"
            color={ACCENT}
          />
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
                background:   "rgba(0,0,0,0.35)",
                border:       "1px solid rgba(96,255,18,0.12)",
                borderTop:    `2px solid ${i < 2 ? "rgba(96,255,18,0.45)" : "rgba(96,255,18,0.7)"}`,
                borderRadius: "0 0 8px 8px",
                padding:      "12px 14px",
              }}
            >
              {/* Pilar number */}
              <p style={{
                margin: "0 0 4px", ...TXT,
                fontSize: 10, fontWeight: 700,
                color: ACCENT, letterSpacing: "0.07em",
                textTransform: "uppercase",
              }}>
                {pilar.numero}
              </p>

              {/* Pilar name */}
              <p style={{
                margin: "0 0 8px", ...TXT,
                fontSize: 13, fontWeight: 700,
                color: "var(--text)", lineHeight: 1.3,
              }}>
                {pilar.nombre}
              </p>

              {/* Pilar detail */}
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

        {/* Nota — Pilar 3 es la síntesis */}
        <p style={{
          margin: "16px 0 0", ...TXT,
          fontSize: 11, lineHeight: 1.5,
          color: "#4b5563", fontStyle: "italic",
        }}>
          Los Pilares 1 y 2 son insumos para el Pilar 3. El mapa no se puede hacer sin los datos —
          y sin el mapa, cualquier propuesta de fusión es política, no técnica.
        </p>
      </div>

      {/* Footer */}
      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 10, fontSize: 10, textTransform: "uppercase",
        color: "var(--text-muted)", ...TXT,
        fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em",
      }}>
        <span>FUENTE: Elaboración propia · MásOpciones 2025</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
