import React, { useEffect, useRef, useState } from "react";

const DATA = [
  { cartera: "Interior + Justicia", empleadosAntes: 749,  empleadosDespues: 524,  gastoAntes: 20.8, gastoDespues: 21.5 },
  { cartera: "Salud + Trabajo",     empleadosAntes: 1741, empleadosDespues: 1683, gastoAntes: 46.0, gastoDespues: 47.1 },
  { cartera: "Ambiente + Vivienda", empleadosAntes: 300,  empleadosDespues: 362,  gastoAntes: 9.2,  gastoDespues: 13.8 },
];

const TOTALES = {
  empleadosAntes:   2790,
  empleadosDespues: 2569,
  gastoAntes:       76.1,
  gastoDespues:     82.5,
};

// Fixed viewBox per panel
const PANEL_W  = 460;
const CHART_H  = 260;
const MG       = { top: 28, right: 14, bottom: 72, left: 50 };
const PLOT_H   = CHART_H - MG.top - MG.bottom; // 160

const C_BEFORE  = "rgba(156,163,175,0.35)";
const C_EMP_AFT = "rgba(96,255,18,0.55)";
const C_GAS_AFT = "rgba(239,68,68,0.55)";
const TXT       = { fontFamily: "var(--font-sans)", fontVariantNumeric: "tabular-nums" };

const chartTxt = {
  fontFamily:         "var(--font-sans)",
  fontVariantNumeric: "tabular-nums",
  fontSize:           10,
  fill:               "var(--text-muted)",
};

function yTx(val, yMax) {
  return MG.top + (1 - val / yMax) * PLOT_H;
}
function groupCX(i, plotW) {
  return MG.left + (i + 0.5) * (plotW / DATA.length);
}
function splitLabel(str) {
  const idx = str.indexOf(" + ");
  if (idx < 0) return [str];
  return [str.slice(0, idx + 2), str.slice(idx + 3)];
}

// ─── PanelChart — pure SVG, viewBox-based ─────────────────────────────────────

function PanelChart({ title, subtitle, yMax, yTicks, formatVal, colorAfter,
  valAntes, valDespues, animated, onHover, onLeave, svgRef }) {
  const plotW = PANEL_W - MG.left - MG.right; // 396
  const barW  = Math.min(28, (plotW / DATA.length - 10) / 2);
  const yBot  = MG.top + PLOT_H;

  return (
    <div style={{ flex: "1 1 0", minWidth: 0 }}>
      <div style={{ marginBottom: 8 }}>
        <p style={{ margin: 0, ...TXT, fontSize: 12, fontWeight: 700, color: "var(--text)" }}>
          {title}
        </p>
        {subtitle && (
          <p style={{ margin: "2px 0 0", ...TXT, fontSize: 10, color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${PANEL_W} ${CHART_H}`}
        width="100%"
        style={{ display: "block", height: "auto", overflow: "visible" }}
      >
        {/* Grid + Y labels */}
        {yTicks.map((tick) => {
          const ty = yTx(tick, yMax);
          return (
            <g key={tick}>
              <line x1={MG.left} y1={ty} x2={MG.left + plotW} y2={ty}
                stroke="var(--viz-grid)" strokeWidth={1} opacity={0.5} />
              <text x={MG.left - 7} y={ty + 4} textAnchor="end" style={chartTxt}>
                {formatVal(tick)}
              </text>
            </g>
          );
        })}

        {/* Baseline */}
        <line x1={MG.left} y1={yBot} x2={MG.left + plotW} y2={yBot}
          stroke="var(--border)" strokeWidth={1} />

        {/* Bars */}
        {DATA.map((d, i) => {
          const cx   = groupCX(i, plotW);
          const vA   = valAntes[i];
          const vD   = valDespues[i];
          const hA   = Math.max(0, yBot - yTx(vA, yMax));
          const hD   = Math.max(0, yBot - yTx(vD, yMax));
          const xA   = cx - barW - 2;
          const xD   = cx + 2;
          const d1   = `${i * 0.1}s`;
          const d2   = `${i * 0.1 + 0.07}s`;
          const lblColorD = colorAfter === C_EMP_AFT ? "#86efac" : "#fca5a5";
          const parts = splitLabel(d.cartera);
          return (
            <g key={d.cartera}>
              <rect x={xA} y={yBot - hA} width={barW} height={hA} fill={C_BEFORE}
                style={{ transformBox: "fill-box", transformOrigin: "50% 100%",
                  transform: animated ? "scaleY(1)" : "scaleY(0)",
                  transition: `transform 0.55s ease ${d1}` }}
                onMouseEnter={(e) => onHover(e, d, "Antes", vA)}
                onMouseLeave={onLeave}
              />
              <rect x={xD} y={yBot - hD} width={barW} height={hD} fill={colorAfter}
                style={{ transformBox: "fill-box", transformOrigin: "50% 100%",
                  transform: animated ? "scaleY(1)" : "scaleY(0)",
                  transition: `transform 0.55s ease ${d2}` }}
                onMouseEnter={(e) => onHover(e, d, "Después", vD)}
                onMouseLeave={onLeave}
              />
              {/* Value labels */}
              <text x={xA + barW / 2} y={yBot - hA - 5} textAnchor="middle"
                style={{ ...chartTxt, opacity: animated ? 1 : 0,
                  transition: `opacity 0.3s ease ${d1}` }}>
                {formatVal(vA)}
              </text>
              <text x={xD + barW / 2} y={yBot - hD - 5} textAnchor="middle"
                style={{ ...chartTxt, fill: lblColorD, fontWeight: 600,
                  opacity: animated ? 1 : 0, transition: `opacity 0.3s ease ${d2}` }}>
                {formatVal(vD)}
              </text>
              {/* X labels */}
              {parts.map((line, li) => (
                <text key={li} x={cx} y={yBot + 16 + li * 13} textAnchor="middle" style={chartTxt}>
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
        {[{ color: C_BEFORE, label: "Antes" }, { color: colorAfter, label: "Después" }].map(
          ({ color, label }) => (
            <span key={label} style={{ display: "inline-flex", alignItems: "center",
              gap: 5, ...TXT, fontSize: 10, color: "var(--text-muted)" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2,
                background: color, flexShrink: 0 }} />
              {label}
            </span>
          )
        )}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

const sectionStyle = {
  width:      "100%",
  margin:     "2.8rem 0 3.2rem",
  padding:    "0.15rem 0",
  fontFamily: "var(--font-sans)",
  color:      "var(--text)",
};

const panelStyle = {
  position:     "relative",
  overflow:     "visible",
  width:        "100%",
  background:
    "radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 8%, transparent), transparent 36%), " +
    "linear-gradient(160deg, var(--viz-panel-strong) 0%, var(--viz-panel) 100%)",
  borderRadius: "16px",
  padding:      "20px 16px 20px",
  border:       "1px solid var(--border)",
  boxShadow:    "var(--viz-shadow)",
};

const tooltipStyle = {
  position:             "absolute",
  background:           "var(--viz-tooltip-bg)",
  border:               "1px solid var(--viz-tooltip-border)",
  borderRadius:         6,
  padding:              "8px 12px",
  boxShadow:            "var(--viz-tooltip-shadow)",
  backdropFilter:       "var(--viz-tooltip-backdrop)",
  WebkitBackdropFilter: "var(--viz-tooltip-backdrop)",
  pointerEvents:        "none",
  minWidth:             150,
};

export default function GraficoColombia() {
  const wrapRef  = useRef(null);
  const svg1Ref  = useRef(null);
  const [animated, setAnimated] = useState(false);
  const [tooltip,  setTooltip]  = useState(null);

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimated(true))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  const empDelta   = TOTALES.empleadosDespues - TOTALES.empleadosAntes;
  const empPct     = ((empDelta / TOTALES.empleadosAntes) * 100).toFixed(1);
  const gastoDelta = (TOTALES.gastoDespues - TOTALES.gastoAntes).toFixed(1);
  const gastoPct   = (((TOTALES.gastoDespues - TOTALES.gastoAntes) / TOTALES.gastoAntes) * 100).toFixed(1);

  function handleHover(e, d, type, val) {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      cartera: d.cartera, type, val,
      contW: rect.width,
    });
  }

  return (
    <section style={sectionStyle}>
      {/* Panel — contains only the two bar charts */}
      <div style={panelStyle} ref={wrapRef} onMouseLeave={() => setTooltip(null)}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <PanelChart
            title="Planta de personal"
            subtitle="número de empleados"
            yMax={2000}
            yTicks={[0, 500, 1000, 1500, 2000]}
            formatVal={(v) => v.toLocaleString("es-CR")}
            colorAfter={C_EMP_AFT}
            valAntes={DATA.map((d) => d.empleadosAntes)}
            valDespues={DATA.map((d) => d.empleadosDespues)}
            animated={animated}
            onHover={handleHover}
            onLeave={() => setTooltip(null)}
            svgRef={svg1Ref}
          />
          <PanelChart
            title="Gasto de personal"
            subtitle="miles de millones COP · pesos constantes 2002"
            yMax={55}
            yTicks={[0, 10, 20, 30, 40, 50]}
            formatVal={(v) => `$${v}`}
            colorAfter={C_GAS_AFT}
            valAntes={DATA.map((d) => d.gastoAntes)}
            valDespues={DATA.map((d) => d.gastoDespues)}
            animated={animated}
            onHover={handleHover}
            onLeave={() => setTooltip(null)}
          />
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div style={{
            ...tooltipStyle,
            left: `${tooltip.x + (tooltip.x > tooltip.contW / 2 ? -170 : 14)}px`,
            top:  `${tooltip.y - 14}px`,
          }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4,
              fontFamily: "var(--font-sans)" }}>
              {tooltip.cartera}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)",
                fontFamily: "var(--font-sans)" }}>{tooltip.type}</span>
              <strong style={{ fontSize: 11, color: "var(--text)",
                fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-sans)" }}>
                {typeof tooltip.val === "number" && tooltip.val < 100
                  ? `$${tooltip.val}B`
                  : tooltip.val.toLocaleString("es-CR")}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* KPI summary — outside the panel */}
      <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 160px", padding: "14px 16px",
          border: "1px solid var(--border)", borderRadius: 12 }}>
          <p style={{ margin: "0 0 2px", ...TXT, fontSize: 10,
            color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Planta total
          </p>
          <p style={{ margin: 0, ...TXT, fontSize: 20, fontWeight: 800,
            color: "#86efac", lineHeight: 1.1 }}>
            {empDelta.toLocaleString("es-CR")} empleados
          </p>
          <p style={{ margin: "3px 0 0", ...TXT, fontSize: 12, color: "var(--text-muted)" }}>
            {empPct}% · parece un éxito
          </p>
        </div>
        <div style={{ flex: "1 1 160px", padding: "14px 16px",
          border: "1px solid var(--border)", borderRadius: 12 }}>
          <p style={{ margin: "0 0 2px", ...TXT, fontSize: 10,
            color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Gasto de personal
          </p>
          <p style={{ margin: 0, ...TXT, fontSize: 20, fontWeight: 800,
            color: "#fca5a5", lineHeight: 1.1 }}>
            +${gastoDelta}B en gasto
          </p>
          <p style={{ margin: "3px 0 0", ...TXT, fontSize: 12, color: "var(--text-muted)" }}>
            +{gastoPct}% · este es el problema
          </p>
        </div>
      </div>

      {/* Editorial quote — outside the panel, plain text */}
      <p style={{ margin: "12px 0 0", ...TXT, fontSize: 13, lineHeight: 1.6,
        color: "var(--text-muted)", fontStyle: "italic" }}>
        "El ponente de la ley reconoció el fracaso. En 2011, el gobierno Santos revirtió las
        fusiones mediante la{" "}
        <span style={{ fontStyle: "normal", color: "#fbbf24", fontWeight: 600 }}>Ley 1444</span>."
      </p>

      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginTop: 12, fontSize: 10, textTransform: "uppercase",
        color: "var(--text-muted)", fontFamily: "var(--font-sans)",
        fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em",
      }}>
        <span>FUENTE: ESAP · Escuela Superior de Administración Pública · Colombia</span>
        <span>PROYECTO: MÁSOPCIONES</span>
      </footer>
    </section>
  );
}
