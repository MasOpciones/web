import React, { useEffect, useRef, useState } from "react";

const ROWS = [
  {
    id:        "ineficiencia",
    valor:     2300,
    unidad:    "miles de millones ₡",
    desc:      "desperdicio anual estimado por CGR",
    subtext:   "15–20 % del presupuesto sin resultado comprobable",
    estimated: false,
    color:     "var(--accent)",
  },
  {
    id:        "intereses",
    valor:     2370,
    unidad:    "miles de millones ₡",
    desc:      "intereses de la deuda pública (2024)",
    subtext:   "Costo financiero del endeudamiento acumulado — MHCP",
    estimated: false,
    color:     "#f87171",
  },
  {
    id:        "duplicidades",
    valor:     67,
    unidad:    "estructuras",
    desc:      "órganos adscritos duplicados sin personalidad jurídica",
    subtext:   "* Estimación basada en diagnóstico CGR — pendiente auditoría integral",
    estimated: true,
    color:     "var(--text-muted)",
  },
];

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
  borderRadius: "16px", padding: "28px 24px 24px",
  border: "1px solid var(--border)", boxShadow: "var(--viz-shadow)",
};

// Animated counter hook
function useCounter(target, duration, active) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const start    = performance.now();
    const from     = 0;

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active, target, duration]);

  return display;
}

function KpiRow({ row, index, active }) {
  const duration = 900 + index * 200;
  const count    = useCounter(row.valor, duration, active);

  return (
    <div style={{
      display:      "flex",
      alignItems:   "center",
      gap:          20,
      padding:      "16px 18px",
      borderRadius: 10,
      border:       row.estimated
        ? "1px dashed rgba(156,163,175,0.3)"
        : "1px solid var(--border)",
      background:   row.estimated
        ? "rgba(156,163,175,0.03)"
        : "rgba(255,255,255,0.02)",
      opacity:      active ? 1 : 0,
      transform:    active ? "translateY(0)" : "translateY(10px)",
      transition:   `opacity 0.5s ease ${index * 0.12}s, transform 0.5s ease ${index * 0.12}s`,
    }}>
      {/* Number */}
      <div style={{
        minWidth:   120,
        flexShrink: 0,
      }}>
        <span style={{
          ...TXT,
          fontSize:   "clamp(1.8rem, 4vw, 2.4rem)",
          fontWeight: 800,
          lineHeight: 1,
          color:      row.color,
          opacity:    row.estimated ? 0.65 : 1,
        }}>
          {count.toLocaleString("es-CR")}
        </span>
        <div style={{
          ...TXT, fontSize: 10, color: "var(--text-muted)",
          marginTop: 4, textTransform: "uppercase", letterSpacing: "0.04em",
          opacity: row.estimated ? 0.65 : 1,
        }}>
          {row.unidad}
        </div>
      </div>

      {/* Separator */}
      <div style={{ width: 1, alignSelf: "stretch", background: "var(--border)", flexShrink: 0 }} />

      {/* Description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          ...TXT, fontSize: 13, fontWeight: 600,
          color: row.estimated ? "var(--text-muted)" : "var(--text)",
          lineHeight: 1.3, marginBottom: 4,
          opacity: row.estimated ? 0.75 : 1,
        }}>
          {row.desc}
        </div>
        <div style={{
          ...TXT, fontSize: 10.5,
          color: "var(--text-muted)",
          lineHeight: 1.45,
          fontStyle: row.estimated ? "italic" : "normal",
          opacity: row.estimated ? 0.6 : 0.8,
        }}>
          {row.subtext}
        </div>
      </div>
    </div>
  );
}

export default function GraficoCostosDocumentados() {
  const [active, setActive] = useState(false);
  const ref    = useRef(null);

  // Trigger counters when element enters viewport
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); obs.disconnect(); } },
      { threshold: 0.25 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section style={sectionStyle}>
      <div style={panelStyle} ref={ref}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ROWS.map((row, i) => (
            <KpiRow key={row.id} row={row} index={i} active={active} />
          ))}
        </div>

        {/* Nota al pie del estimado */}
        <div style={{
          ...TXT,
          marginTop:   16,
          paddingTop:  12,
          borderTop:   "1px solid var(--border)",
          fontSize:    10.5,
          fontStyle:   "italic",
          color:       "var(--text-muted)",
          opacity:     active ? 0.55 : 0,
          transition:  "opacity 0.5s ease 0.5s",
          lineHeight:  1.5,
        }}>
          * Los órganos adscritos no tienen personalidad jurídica propia y fueron creados por decreto ejecutivo o ley ordinaria.
          Pueden suprimirse sin reforma constitucional, pero requieren voluntad política y ley ordinaria.
        </div>
      </div>

      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 10, fontSize: 10, textTransform: "uppercase",
        color: "var(--text-muted)", ...TXT, letterSpacing: "0.04em",
      }}>
        <span>FUENTE: CGR · MHCP · MIDEPLAN — Informes 2022–2024</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
