import React, { useEffect, useRef, useState } from "react";

const DATA = [
  {
    cartera:          "Interior + Justicia",
    empleadosAntes:   749,
    empleadosDespues: 524,
    gastoAntes:       20.8,
    gastoDespues:     21.5,
  },
  {
    cartera:          "Salud + Trabajo",
    empleadosAntes:   1741,
    empleadosDespues: 1683,
    gastoAntes:       46.0,
    gastoDespues:     47.1,
  },
  {
    cartera:          "Ambiente + Vivienda",
    empleadosAntes:   300,
    empleadosDespues: 362,
    gastoAntes:       9.2,
    gastoDespues:     13.8,
  },
];

const TOTALES = {
  empleadosAntes:   2790,
  empleadosDespues: 2569,
  gastoAntes:       76.1,
  gastoDespues:     82.5,
};

const CHART_H   = 284;
const MG        = { top: 32, right: 14, bottom: 76, left: 52 };
const C_BEFORE  = "#374151";
const C_EMP_AFT = "rgba(96,255,18,0.55)";
const C_GAS_AFT = "rgba(239,68,68,0.65)";
const TXT       = { fontFamily: "var(--font-sans)", fontVariantNumeric: "tabular-nums" };

// ─── helpers ──────────────────────────────────────────────────────────────────

function yTx(val, yMax, plotH) {
  return MG.top + (1 - val / yMax) * plotH;
}
function groupCX(i, plotW) {
  return MG.left + (i + 0.5) * (plotW / DATA.length);
}

function splitLabel(str) {
  const idx = str.indexOf(" + ");
  if (idx < 0) return [str];
  return [str.slice(0, idx + 2), str.slice(idx + 3)]; // keeps "+"" on first line
}

// ─── PanelChart ───────────────────────────────────────────────────────────────

function PanelChart({
  panelW, title, subtitle,
  yMax, yTicks, formatVal,
  colorAfter,
  valAntes, valDespues,   // arrays of numbers indexed to DATA
  animated, wrapRef,
  onHover, onLeave,
}) {
  const plotW = Math.max(panelW - MG.left - MG.right, 10);
  const plotH = CHART_H - MG.top - MG.bottom;
  const groupW = plotW / DATA.length;
  const barW   = Math.min(26, (groupW - 10) / 2);
  const yBot   = MG.top + plotH;

  function handleBarEnter(e, d, type, val) {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    onHover({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      cartera: d.cartera,
      type,
      val,
    });
  }

  return (
    <div style={{ position: "relative", flex: "1 1 0", minWidth: 0 }}>
      {/* Panel title */}
      <div style={{ marginBottom: 6, paddingLeft: MG.left }}>
        <p style={{ margin: 0, ...TXT, fontSize: 12, fontWeight: 700, color: "var(--text)" }}>
          {title}
        </p>
        {subtitle && (
          <p style={{ margin: "1px 0 0", ...TXT, fontSize: 10, color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>

      <svg
        width={panelW}
        height={CHART_H}
        style={{ display: "block", overflow: "visible" }}
      >
        {/* Grid lines + Y labels */}
        {yTicks.map((tick) => {
          const ty = yTx(tick, yMax, plotH);
          return (
            <g key={`g-${tick}`}>
              <line
                x1={MG.left} y1={ty} x2={MG.left + plotW} y2={ty}
                stroke="#1f2937" strokeWidth={1}
              />
              <text
                x={MG.left - 7} y={ty + 4}
                textAnchor="end"
                style={{ ...TXT, fontSize: 9.5, fill: "var(--text-muted)" }}
              >
                {formatVal(tick)}
              </text>
            </g>
          );
        })}

        {/* Baseline */}
        <line
          x1={MG.left} y1={yBot}
          x2={MG.left + plotW} y2={yBot}
          stroke="#374151" strokeWidth={1}
        />

        {/* Bars + x labels */}
        {DATA.map((d, i) => {
          const cx     = groupCX(i, plotW);
          const vA     = valAntes[i];
          const vD     = valDespues[i];
          const hA     = Math.max(0, yBot - yTx(vA, yMax, plotH));
          const hD     = Math.max(0, yBot - yTx(vD, yMax, plotH));
          const xA     = cx - barW - 2;
          const xD     = cx + 2;
          const delay1 = `${i * 0.1}s`;
          const delay2 = `${i * 0.1 + 0.06}s`;
          const parts  = splitLabel(d.cartera);

          return (
            <g key={d.cartera}>
              {/* Antes bar */}
              <rect
                x={xA} y={yBot - hA} width={barW} height={hA}
                fill={C_BEFORE}
                style={{
                  transformBox:    "fill-box",
                  transformOrigin: "50% 100%",
                  transform:       animated ? "scaleY(1)" : "scaleY(0)",
                  transition:      `transform 0.55s ease ${delay1}`,
                  cursor:          "crosshair",
                }}
                onMouseEnter={(e) => handleBarEnter(e, d, "Antes", vA)}
                onMouseLeave={onLeave}
              />

              {/* Después bar */}
              <rect
                x={xD} y={yBot - hD} width={barW} height={hD}
                fill={colorAfter}
                style={{
                  transformBox:    "fill-box",
                  transformOrigin: "50% 100%",
                  transform:       animated ? "scaleY(1)" : "scaleY(0)",
                  transition:      `transform 0.55s ease ${delay2}`,
                  cursor:          "crosshair",
                }}
                onMouseEnter={(e) => handleBarEnter(e, d, "Después", vD)}
                onMouseLeave={onLeave}
              />

              {/* Value labels above bars (visible after animation) */}
              <text
                x={xA + barW / 2} y={yBot - hA - 4}
                textAnchor="middle"
                style={{
                  ...TXT, fontSize: 9, fill: "#6b7280",
                  opacity: animated ? 1 : 0,
                  transition: `opacity 0.3s ease ${delay1}`,
                }}
              >
                {formatVal(vA)}
              </text>
              <text
                x={xD + barW / 2} y={yBot - hD - 4}
                textAnchor="middle"
                style={{
                  ...TXT, fontSize: 9,
                  fill: colorAfter === C_EMP_AFT ? "#86efac" : "#fca5a5",
                  fontWeight: 600,
                  opacity: animated ? 1 : 0,
                  transition: `opacity 0.3s ease ${delay2}`,
                }}
              >
                {formatVal(vD)}
              </text>

              {/* X-axis label (2 lines) */}
              {parts.map((line, li) => (
                <text
                  key={li}
                  x={cx} y={yBot + 16 + li * 13}
                  textAnchor="middle"
                  style={{ ...TXT, fontSize: 9.5, fill: "var(--text-muted)" }}
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{
        display: "flex", gap: 14, paddingLeft: MG.left,
        marginTop: -4,
      }}>
        {[
          { color: C_BEFORE,   label: "Antes" },
          { color: colorAfter, label: "Después" },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5, ...TXT, fontSize: 10, color: "var(--text-muted)" }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
            {label}
          </span>
        ))}
      </div>
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
  position: "relative",
  width: "100%",
  background:
    "radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 8%, transparent), transparent 36%), " +
    "linear-gradient(160deg, var(--viz-panel-strong) 0%, var(--viz-panel) 100%)",
  borderRadius: "16px",
  padding: "20px 16px 20px",
  border: "1px solid var(--border)",
  boxShadow: "var(--viz-shadow)",
};

export default function GraficoColombia() {
  const wrapRef = useRef(null);
  const [contW,    setContW]    = useState(640);
  const [animated, setAnimated] = useState(false);
  const [tooltip,  setTooltip]  = useState(null);

  // ResizeObserver
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setContW(w);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Animate on mount
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimated(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  const isMobile = contW < 520;
  const gap      = isMobile ? 0 : 20;
  const panelW   = isMobile ? contW - 32 : Math.floor((contW - 32 - gap) / 2);

  const empDelta   = TOTALES.empleadosDespues - TOTALES.empleadosAntes; // −221
  const empPct     = ((empDelta / TOTALES.empleadosAntes) * 100).toFixed(1);
  const gastoDelta = (TOTALES.gastoDespues - TOTALES.gastoAntes).toFixed(1); // +6.4
  const gastoPct   = ((( TOTALES.gastoDespues - TOTALES.gastoAntes) / TOTALES.gastoAntes) * 100).toFixed(1);

  return (
    <section style={sectionStyle}>
      {/* Header */}
      <header style={{ marginBottom: 14 }}>
        <p style={{
          margin: 0, fontSize: 11, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "var(--text-muted)",
          fontWeight: 700, fontFamily: "var(--font-sans)",
        }}>
          ACTO IV · ADVERTENCIA COMPARADA
        </p>
        <h3 style={{
          fontSize: "clamp(1.3rem, 2.8vw, 1.9rem)", fontWeight: 800,
          lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--text)",
          margin: "4px 0 6px", fontFamily: "var(--font-sans)",
        }}>
          Colombia fusionó ministerios — y el gasto subió igual
        </h3>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, fontFamily: "var(--font-sans)" }}>
          Ley 790 de 2002 · Cambio en planta y gasto de personal antes y después de las fusiones
        </p>
      </header>

      {/* Panel */}
      <div style={panelStyle} ref={wrapRef} onMouseLeave={() => setTooltip(null)}>
        {/* Charts row */}
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: gap,
          alignItems: "flex-start",
        }}>
          <PanelChart
            panelW={panelW}
            title="Planta de personal"
            subtitle="número de empleados"
            yMax={2000}
            yTicks={[0, 500, 1000, 1500, 2000]}
            formatVal={(v) => v.toLocaleString("es-CR")}
            colorAfter={C_EMP_AFT}
            valAntes={DATA.map((d) => d.empleadosAntes)}
            valDespues={DATA.map((d) => d.empleadosDespues)}
            animated={animated}
            wrapRef={wrapRef}
            onHover={setTooltip}
            onLeave={() => setTooltip(null)}
          />

          {/* Vertical divider (desktop only) */}
          {!isMobile && (
            <div style={{ width: 1, background: "#1f2937", alignSelf: "stretch", flexShrink: 0 }} />
          )}

          {isMobile && (
            <div style={{ height: 1, background: "#1f2937", width: "100%", margin: "8px 0" }} />
          )}

          <PanelChart
            panelW={panelW}
            title="Gasto de personal"
            subtitle="miles de millones COP · pesos constantes 2002"
            yMax={55}
            yTicks={[0, 10, 20, 30, 40, 50]}
            formatVal={(v) => `$${v}`}
            colorAfter={C_GAS_AFT}
            valAntes={DATA.map((d) => d.gastoAntes)}
            valDespues={DATA.map((d) => d.gastoDespues)}
            animated={animated}
            wrapRef={wrapRef}
            onHover={setTooltip}
            onLeave={() => setTooltip(null)}
          />
        </div>

        {/* KPI cards */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid #1f2937",
        }}>
          {/* KPI: empleados */}
          <div style={{
            flex: "1 1 180px",
            background: "rgba(96,255,18,0.06)",
            border: "1px solid rgba(96,255,18,0.18)",
            borderRadius: 10,
            padding: "12px 16px",
          }}>
            <p style={{ margin: "0 0 2px", ...TXT, fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Planta total
            </p>
            <p style={{ margin: 0, ...TXT, fontSize: 20, fontWeight: 800, color: "#86efac", lineHeight: 1.1 }}>
              {empDelta.toLocaleString("es-CR")} empleados
            </p>
            <p style={{ margin: "3px 0 0", ...TXT, fontSize: 12, color: "#9ca3af" }}>
              {empPct}% · parece un éxito
            </p>
          </div>

          {/* KPI: gasto */}
          <div style={{
            flex: "1 1 180px",
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.22)",
            borderRadius: 10,
            padding: "12px 16px",
          }}>
            <p style={{ margin: "0 0 2px", ...TXT, fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Gasto de personal
            </p>
            <p style={{ margin: 0, ...TXT, fontSize: 20, fontWeight: 800, color: "#fca5a5", lineHeight: 1.1 }}>
              +${gastoDelta}B en gasto
            </p>
            <p style={{ margin: "3px 0 0", ...TXT, fontSize: 12, color: "#9ca3af" }}>
              +{gastoPct}% · este es el problema
            </p>
          </div>
        </div>

        {/* Editorial annotation */}
        <div style={{
          marginTop: 16,
          padding: "10px 14px",
          borderLeft: "3px solid #f59e0b",
          background: "rgba(245,158,11,0.05)",
          borderRadius: "0 8px 8px 0",
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          lineHeight: 1.6,
          color: "var(--text-muted)",
          fontStyle: "italic",
        }}>
          "El ponente de la ley reconoció el fracaso. En 2011, el gobierno Santos revirtió las
          fusiones mediante la{" "}
          <strong style={{ fontStyle: "normal", color: "#fbbf24", fontWeight: 600 }}>
            Ley 1444
          </strong>."
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div style={{
            position:       "absolute",
            background:     "var(--viz-tooltip-bg-bar)",
            border:         "1px solid var(--viz-tooltip-border)",
            borderRadius:   6,
            padding:        "7px 11px",
            boxShadow:      "var(--viz-tooltip-shadow)",
            backdropFilter: "var(--viz-tooltip-backdrop)",
            WebkitBackdropFilter: "var(--viz-tooltip-backdrop)",
            pointerEvents:  "none",
            minWidth:       140,
            left:           `${tooltip.x + (tooltip.x > contW / 2 ? -160 : 14)}px`,
            top:            `${tooltip.y - 14}px`,
            fontFamily:     "var(--font-sans)",
          }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>
              {tooltip.cartera}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{tooltip.type}</span>
              <strong style={{ fontSize: 11, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
                {typeof tooltip.val === "number" && tooltip.val < 100
                  ? `$${tooltip.val}B`
                  : tooltip.val.toLocaleString("es-CR")}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 10, fontSize: 10, textTransform: "uppercase",
        color: "var(--text-muted)", fontFamily: "var(--font-sans)",
        fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em",
      }}>
        <span>FUENTE: ESAP · Escuela Superior de Administración Pública · Colombia</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
