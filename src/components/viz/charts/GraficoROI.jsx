import React, { useEffect, useRef, useState } from "react";

const DATA = {
  costoAuditoria: {
    valor: 15,
    label: "Costo estimado de la auditoría",
  },
  ineficienciaAnual: {
    valor: 2300,
    label: "Ineficiencia anual estimada del gasto público",
  },
  interesesDeuda: {
    valor: 2370,
    label: "Intereses de la deuda pública (2024)",
  },
  ratio: 153,
};

const MAX_VAL = DATA.interesesDeuda.valor; // 2370 — longest bar
const TXT     = { fontFamily: "var(--font-sans)", fontVariantNumeric: "tabular-nums" };
const ACCENT  = "#60ff12";

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

// ─── Horizontal bar ──────────────────────────────────────────────────────────
// Label is a flex sibling of the track — always inside the container, never overflows.

function HBar({ valor, colorFill, label, animated }) {
  const pct = (valor / MAX_VAL) * 100;

  return (
    <div style={{ marginBottom: 18 }}>
      {/* Row label */}
      <div style={{ marginBottom: 6, ...TXT, fontSize: 11, color: "var(--text-muted)" }}>
        {label}
      </div>

      {/* Track + value side by side */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Track */}
        <div style={{
          flex:         1,
          position:     "relative",
          height:       8,
          background:   "rgba(255,255,255,0.05)",
          borderRadius: 999,
          overflow:     "hidden",
        }}>
          {/* Fill */}
          <div style={{
            position:     "absolute",
            left:         0, top: 0, bottom: 0,
            width:        animated ? `${Math.max(pct, 0.15)}%` : "0%",
            background:   colorFill,
            borderRadius: 999,
            transition:   "width 1.1s cubic-bezier(0.16,1,0.3,1)",
          }} />
        </div>

        {/* Value label — flex sibling, always inside container */}
        <span style={{
          flexShrink:  0,
          minWidth:    48,
          textAlign:   "right",
          ...TXT,
          fontSize:    11,
          color:       "var(--text-muted)",
          whiteSpace:  "nowrap",
          opacity:     animated ? 1 : 0,
          transition:  "opacity 0.4s ease 0.8s",
        }}>
          ${valor.toLocaleString("en-US")}M
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const sectionStyle = {
  width:      "100%",
  margin:     "2.8rem 0 3.2rem",
  padding:    "0.15rem 0",
  fontFamily: "var(--font-sans)",
  color:      "var(--text)",
};

const panelStyle = {
  width:        "100%",
  background:   "var(--viz-panel)",
  borderRadius: "16px",
  padding:      "24px 20px",
  border:       "1px solid var(--border)",
};

const divider = {
  height:     1,
  background: "var(--border)",
  margin:     "20px 0",
};

export default function GraficoROI() {
  const [mounted, setMounted] = useState(false);
  const [count,   setCount]   = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setMounted(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let rafId;
    const delay = setTimeout(() => {
      let start = null;
      const duration = 1400;
      function step(ts) {
        if (!start) start = ts;
        const t = Math.min((ts - start) / duration, 1);
        setCount(Math.round(easeOut(t) * DATA.ratio));
        if (t < 1) rafId = requestAnimationFrame(step);
      }
      rafId = requestAnimationFrame(step);
    }, 400);
    return () => { clearTimeout(delay); cancelAnimationFrame(rafId); };
  }, [mounted]);

  return (
    <section style={sectionStyle}>
      <div style={panelStyle}>

        {/* ── Sección 1: Barras a escala real ── */}
        <p style={{
          margin: "0 0 14px", ...TXT,
          fontSize: 10, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.07em",
          color: "var(--text-muted)",
        }}>
          Comparación a escala real
        </p>

        <HBar
          valor={DATA.costoAuditoria.valor}
          colorFill="rgba(156,163,175,0.4)"
          label={DATA.costoAuditoria.label}
          animated={mounted}
        />
        <HBar
          valor={DATA.ineficienciaAnual.valor}
          colorFill="rgba(96,255,18,0.35)"
          label={DATA.ineficienciaAnual.label}
          animated={mounted}
        />

        <div style={divider} />

        {/* ── Sección 2: KPI central — 153× ── */}
        <div style={{ textAlign: "center", padding: "8px 0 12px" }}>
          <div
            ref={countRef}
            style={{
              ...TXT,
              fontSize:      "clamp(4rem, 12vw, 7rem)",
              fontWeight:    800,
              lineHeight:    1,
              color:         ACCENT,
              letterSpacing: "-0.03em",
              textShadow:    `0 0 40px rgba(96,255,18,0.3)`,
              opacity:       mounted ? 1 : 0,
              transition:    "opacity 0.4s ease 0.3s",
            }}
          >
            {count}×
          </div>
          <p style={{
            margin: "10px 0 6px", ...TXT,
            fontSize:   "clamp(0.95rem, 2.2vw, 1.1rem)",
            fontWeight: 600, color: "var(--text)",
          }}>
            retorno potencial sobre el costo del encargo
          </p>
          <p style={{
            margin: "0 auto", maxWidth: 520,
            ...TXT, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55,
          }}>
            Si la auditoría identificara y permitiera recuperar solo el{" "}
            <strong style={{ color: ACCENT }}>1%</strong> de la ineficiencia
            anual estimada, el encargo se pagaría{" "}
            <strong style={{ color: "var(--text)" }}>15 veces</strong>.
          </p>
        </div>

        <div style={divider} />

        {/* ── Sección 3: Tres KPI cards ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          {[
            {
              valor:    "$15M",
              label:    "Costo estimado del encargo",
              sub:      "Big Four · escala de Estado",
              valColor: "var(--text-muted)",
            },
            {
              valor:    "$2,300M",
              label:    "Ineficiencia anual estimada",
              sub:      "BID · 4.7% del PIB",
              valColor: ACCENT,
            },
            {
              valor:    "$2,370M",
              label:    "Intereses de la deuda en 2024",
              sub:      "Máximo histórico · 19 años",
              valColor: "#f87171",
            },
          ].map(({ valor, label, sub, valColor }) => (
            <div
              key={label}
              style={{
                flex:         "1 1 160px",
                background:   "transparent",
                border:       "1px solid var(--border)",
                borderRadius: 12,
                padding:      "14px 16px",
                opacity:      mounted ? 1 : 0,
                transition:   "opacity 0.5s ease 0.6s",
              }}
            >
              <p style={{
                margin: "0 0 3px", ...TXT,
                fontSize: 22, fontWeight: 800,
                color: valColor, lineHeight: 1.1, letterSpacing: "-0.02em",
              }}>
                {valor}
              </p>
              <p style={{
                margin: "0 0 2px", ...TXT,
                fontSize: 12, fontWeight: 500, color: "var(--text)",
              }}>
                {label}
              </p>
              <p style={{ margin: 0, ...TXT, fontSize: 10, color: "var(--text-muted)" }}>
                {sub}
              </p>
            </div>
          ))}
        </div>

        {/* Nota al pie */}
        <p style={{
          margin: 0, ...TXT,
          fontSize: 13, lineHeight: 1.55,
          color: "var(--text-muted)", fontStyle: "italic",
        }}>
          Los tres números son del mismo orden de magnitud. El primero es el único que{" "}
          <span style={{ color: "var(--text)" }}>todavía no se ha gastado</span>.
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
        fontFamily:         "var(--font-sans)",
        fontVariantNumeric: "tabular-nums",
        letterSpacing:      "0.04em",
      }}>
        <span>FUENTE: BID · Ministerio de Hacienda CR · estimaciones propias</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
