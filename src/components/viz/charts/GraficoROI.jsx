import React, { useEffect, useRef, useState } from "react";

const DATA = {
  costoAuditoria: {
    valor: 15,
    label: "Costo estimado de la auditoría",
    nota: "Rango típico Big Four para auditorías de Estado de escala similar: $10M–$20M USD",
  },
  ineficienciaAnual: {
    valor: 2300,
    label: "Ineficiencia anual estimada del gasto público",
    nota: "BID: 4.7% del PIB. Equivalente aproximado en USD al tipo de cambio 2024.",
  },
  interesesDeuda: {
    valor: 2370,
    label: "Intereses de la deuda pública (2024)",
    nota: "Nivel más alto en 19 años. Ministerio de Hacienda, cifras fiscales diciembre 2024.",
  },
  ratio: 153,
};

const MAX_VAL  = DATA.interesesDeuda.valor; // 2370 — longest bar
const TXT      = { fontFamily: "var(--font-sans)", fontVariantNumeric: "tabular-nums" };
const ACCENT   = "#60ff12";

// Easing: ease-out cubic
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

// ─── Horizontal bar ──────────────────────────────────────────────────────────

function HBar({ valor, colorFill, label, nota, animated, isSmall }) {
  const pct    = (valor / MAX_VAL) * 100;
  const minPx  = isSmall ? 3 : undefined; // keep the tiny bar visible as a sliver

  return (
    <div style={{ marginBottom: 18 }}>
      {/* Row label */}
      <div style={{
        display: "flex", alignItems: "baseline", gap: 8,
        marginBottom: 5,
      }}>
        <span style={{ ...TXT, fontSize: 12, color: "var(--text-muted)" }}>
          {label}
        </span>
        {isSmall && (
          <span style={{ ...TXT, fontSize: 10, color: "#6b7280",
            background: "#1f2937", borderRadius: 3, padding: "1px 5px" }}>
            escala real
          </span>
        )}
      </div>

      {/* Bar track */}
      <div style={{ position: "relative", height: isSmall ? 16 : 28 }}>
        {/* Background track */}
        <div style={{
          position: "absolute", inset: 0,
          background: "#111827", borderRadius: 4,
        }} />

        {/* Filled bar */}
        <div style={{
          position:   "absolute",
          left:       0, top: 0, bottom: 0,
          width:      animated ? `${pct}%` : "0%",
          minWidth:   animated && isSmall ? minPx : 0,
          background: colorFill,
          borderRadius: 4,
          transition: `width 1.1s cubic-bezier(0.16,1,0.3,1)`,
          boxShadow:  !isSmall ? `0 0 16px ${colorFill.replace("0.4)", "0.25)")}` : undefined,
        }} />

        {/* Value label — outside bar for small, inside/after for large */}
        {isSmall ? (
          <span style={{
            position:   "absolute",
            left:       "calc(100% + 10px)",
            top:        "50%",
            transform:  "translateY(-50%)",
            ...TXT, fontSize: 11, fontWeight: 700,
            color: "#9ca3af",
            whiteSpace: "nowrap",
            opacity: animated ? 1 : 0,
            transition: "opacity 0.4s ease 0.8s",
          }}>
            ${valor.toLocaleString("en-US")}M
          </span>
        ) : (
          <span style={{
            position:   "absolute",
            right:      10, top: "50%",
            transform:  "translateY(-50%)",
            ...TXT, fontSize: 13, fontWeight: 700,
            color: "var(--text)",
            opacity: animated ? 1 : 0,
            transition: "opacity 0.4s ease 0.9s",
          }}>
            ${valor.toLocaleString("en-US")}M
          </span>
        )}
      </div>

      {/* Nota */}
      <p style={{ margin: "4px 0 0", ...TXT, fontSize: 10, color: "#4b5563", lineHeight: 1.4 }}>
        {nota}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const sectionStyle = {
  width: "100%",
  margin: "2.8rem 0 3.2rem",
  padding: "0.15rem 0",
  fontFamily: "var(--font-sans)",
  color: "var(--text)",
};

const panelStyle = {
  width: "100%",
  background:
    "radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 8%, transparent), transparent 36%), " +
    "linear-gradient(160deg, var(--viz-panel-strong) 0%, var(--viz-panel) 100%)",
  borderRadius: "16px",
  padding: "24px 20px",
  border: "1px solid var(--border)",
  boxShadow: "var(--viz-shadow)",
};

const divider = {
  height: 1,
  background: "#1f2937",
  margin: "20px 0",
};

export default function GraficoROI() {
  const [mounted,   setMounted]   = useState(false);
  const [count,     setCount]     = useState(0);
  const countRef = useRef(null);

  // Stagger: bars animate first, then the counter starts
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setMounted(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  // Counter animation: starts 400ms after mount
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
      {/* Header */}
      <header style={{ marginBottom: 14 }}>
        <p style={{
          margin: 0, fontSize: 11, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "var(--text-muted)",
          fontWeight: 700, fontFamily: "var(--font-sans)",
        }}>
          ACTO V · EL ENCARGO
        </p>
        <h3 style={{
          fontSize: "clamp(1.3rem, 2.8vw, 1.9rem)", fontWeight: 800,
          lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--text)",
          margin: "4px 0 6px", fontFamily: "var(--font-sans)",
        }}>
          $15 millones para auditar $2,300 millones en ineficiencia
        </h3>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, fontFamily: "var(--font-sans)" }}>
          Retorno potencial del encargo de auditoría externa al gasto público
        </p>
      </header>

      <div style={panelStyle}>

        {/* ── Sección 1: Barras a escala real ── */}
        <p style={{ margin: "0 0 14px", ...TXT, fontSize: 11, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.07em", color: "#4b5563" }}>
          Comparación a escala real
        </p>

        <HBar
          valor={DATA.costoAuditoria.valor}
          colorFill="#4b5563"
          label={DATA.costoAuditoria.label}
          nota={DATA.costoAuditoria.nota}
          animated={mounted}
          isSmall
        />
        <HBar
          valor={DATA.ineficienciaAnual.valor}
          colorFill={`rgba(96,255,18,0.38)`}
          label={DATA.ineficienciaAnual.label}
          nota={DATA.ineficienciaAnual.nota}
          animated={mounted}
          isSmall={false}
        />

        <div style={divider} />

        {/* ── Sección 2: KPI central ── */}
        <div style={{ textAlign: "center", padding: "8px 0 12px" }}>
          <div
            ref={countRef}
            style={{
              ...TXT,
              fontSize: "clamp(4rem, 12vw, 7rem)",
              fontWeight: 800,
              lineHeight: 1,
              color: ACCENT,
              letterSpacing: "-0.03em",
              textShadow: `0 0 40px rgba(96,255,18,0.35)`,
              opacity: mounted ? 1 : 0,
              transition: "opacity 0.4s ease 0.3s",
            }}
          >
            {count}×
          </div>
          <p style={{
            margin: "10px 0 6px", ...TXT,
            fontSize: "clamp(0.95rem, 2.2vw, 1.1rem)",
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
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16,
        }}>
          {[
            {
              valor: "$15M",
              label: "Costo estimado del encargo",
              sub: "Big Four · escala de Estado",
              bg: "rgba(55,65,81,0.35)",
              border: "#374151",
              valColor: "#9ca3af",
            },
            {
              valor: "$2,300M",
              label: "Ineficiencia anual estimada",
              sub: "BID · 4.7% del PIB",
              bg: "rgba(96,255,18,0.06)",
              border: "rgba(96,255,18,0.22)",
              valColor: ACCENT,
            },
            {
              valor: "$2,370M",
              label: "Intereses de la deuda en 2024",
              sub: "Máximo histórico · 19 años",
              bg: "rgba(239,68,68,0.06)",
              border: "rgba(239,68,68,0.22)",
              valColor: "#fca5a5",
            },
          ].map(({ valor, label, sub, bg, border, valColor }) => (
            <div
              key={label}
              style={{
                flex: "1 1 160px",
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 10,
                padding: "12px 14px",
                opacity: mounted ? 1 : 0,
                transition: "opacity 0.5s ease 0.6s",
              }}
            >
              <p style={{ margin: "0 0 3px", ...TXT, fontSize: 22, fontWeight: 800,
                color: valColor, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                {valor}
              </p>
              <p style={{ margin: "0 0 2px", ...TXT, fontSize: 12,
                fontWeight: 600, color: "var(--text)" }}>
                {label}
              </p>
              <p style={{ margin: 0, ...TXT, fontSize: 10, color: "var(--text-muted)" }}>
                {sub}
              </p>
            </div>
          ))}
        </div>

        {/* Nota al pie de las cards */}
        <p style={{
          margin: 0,
          padding: "10px 14px",
          borderLeft: "3px solid #374151",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "0 8px 8px 0",
          ...TXT, fontSize: 13, lineHeight: 1.55,
          color: "var(--text-muted)", fontStyle: "italic",
        }}>
          Los tres números son del mismo orden de magnitud. El primero es el único que{" "}
          <strong style={{ color: "var(--text)", fontStyle: "normal" }}>
            todavía no se ha gastado
          </strong>.
        </p>

      </div>

      {/* Footer */}
      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 10, fontSize: 10, textTransform: "uppercase",
        color: "var(--text-muted)", fontFamily: "var(--font-sans)",
        fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em",
      }}>
        <span>FUENTE: BID · Ministerio de Hacienda CR · estimaciones propias</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
