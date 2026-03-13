import React, { useState, useRef } from "react";

type GastoPoint = {
  year: number;
  gtZF: number | null;
  gtISR: number | null;
};

const data: GastoPoint[] = [
  { year: 2020, gtZF: 344,  gtISR: 618  },
  { year: 2021, gtZF: 598,  gtISR: 927  },
  { year: 2022, gtZF: 665,  gtISR: 999  },
  { year: 2023, gtZF: 661,  gtISR: 975  },
  { year: 2024, gtZF: 782,  gtISR: 1041 },
];

const WIDTH = 960;
const HEIGHT = 500;
const MARGIN = { top: 80, right: 120, bottom: 74, left: 80 };
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
const MAX_Y = 1200;
const Y_TICKS = [0, 300, 600, 900, 1200];

const eyebrow = "ACTO III \u00B7 COSTO FISCAL";
const title = "El costo de las exoneraciones casi se duplic\u00F3 en 4 a\u00F1os";
const subtitle = "Gasto tributario: exoneraciones al r\u00E9gimen especial vs ISR total, en miles de millones \u20A1";
const legendZF = "Exoneraciones ZF";
const legendISR = "GT total ISR";
const refLineLabel = "Presupuesto CCSS est. ~2023";
const noteText = "Fuentes: Ministerio de Hacienda, Informes GT 2020\u20132024 (feb 2025 y dic 2025).";
const footerSource = "FUENTE: MINHAC GT 2020. VICEMINISTRO MOLINA, ASAMBLEA OCT 2025.";
const footerProject = "PROYECTO: CR\u00B7PIB\u00B7ZONAS\u00B7FRANCAS";

const chartTextStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fill: "var(--text-muted)",
  fontSize: 11,
  fontVariantNumeric: "tabular-nums",
};

const tooltipWrapStyle: React.CSSProperties = {
  position: "absolute",
  minWidth: 186,
  background: "var(--viz-tooltip-bg-bar)",
  border: "1px solid var(--viz-tooltip-border)",
  borderRadius: 6,
  padding: "10px 14px",
  boxShadow: "var(--viz-tooltip-shadow)",
  backdropFilter: "var(--viz-tooltip-backdrop)",
  WebkitBackdropFilter: "var(--viz-tooltip-backdrop)",
  pointerEvents: "none",
};

const sectionStyle: React.CSSProperties = {
  width: "100%",
  margin: "2.8rem 0 3.2rem",
  padding: "0.15rem 0",
  fontFamily: "var(--font-sans)",
  color: "var(--text)",
};

const panelStyle: React.CSSProperties = {
  position: "relative",
  overflow: "visible",
  width: "100%",
  background:
    "radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 8%, transparent), transparent 36%), linear-gradient(160deg, var(--viz-panel-strong) 0%, var(--viz-panel) 100%)",
  borderRadius: "16px",
  padding: "20px 16px 16px",
  border: "1px solid var(--border)",
  boxShadow: "var(--viz-shadow)",
};

function groupCenter(index: number) {
  return MARGIN.left + (INNER_WIDTH / data.length) * (index + 0.5);
}

function yScale(v: number) {
  return MARGIN.top + (1 - v / MAX_Y) * INNER_HEIGHT;
}

export default function GastoTributarioChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [tooltipX, setTooltipX] = useState(0);
  const [tooltipY, setTooltipY] = useState(0);
  const [isRight, setIsRight] = useState(false);

  const activePoint = data.find((d) => d.year === activeYear) ?? null;

  const groupWidth = INNER_WIDTH / data.length;
  const barWidth = Math.min(36, groupWidth * 0.28);
  const barGap = 6;

  function activateHover(e: React.MouseEvent, point: GastoPoint) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setActiveYear(point.year);
    setTooltipX(mouseX);
    setTooltipY(mouseY);
    setIsRight(mouseX > rect.width / 2);
  }

  return (
    <section style={sectionStyle}>
      <header style={{ marginBottom: 18 }}>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            fontWeight: 700,
          }}
        >
          {eyebrow}
        </p>
        <h3
          style={{
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            margin: "4px 0 6px",
          }}
        >
          {title}
        </h3>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.45, maxWidth: "66ch" }}>
          {subtitle}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--viz-accent)", flexShrink: 0 }} />
            {legendZF}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-muted)", flexShrink: 0 }} />
            {legendISR}
          </span>
        </div>
      </header>

      <div
        style={panelStyle}
        onMouseLeave={() => setActiveYear(null)}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          aria-label={subtitle}
          role="img"
          style={{ display: "block", width: "100%", height: "auto" }}
        >
          {/* Grid lines */}
          <g>
            {Y_TICKS.map((tick) => (
              <line
                key={`grid-${tick}`}
                x1={MARGIN.left}
                y1={yScale(tick)}
                x2={WIDTH - MARGIN.right}
                y2={yScale(tick)}
                stroke="var(--viz-grid)"
                strokeWidth={1}
                opacity={0.65}
              />
            ))}
          </g>

          {/* Baseline */}
          <line
            x1={MARGIN.left}
            y1={yScale(0)}
            x2={WIDTH - MARGIN.right}
            y2={yScale(0)}
            stroke="var(--border)"
            strokeWidth={1.2}
          />

          {/* Reference line at 660 */}
          <line
            x1={MARGIN.left}
            y1={yScale(660)}
            x2={WIDTH - MARGIN.right}
            y2={yScale(660)}
            stroke="var(--viz-grid)"
            strokeDasharray="2 4"
          />
          {/* Bars per group */}
          {data.map((d, i) => {
            const cx = groupCenter(i);
            const zfX = cx - barWidth - barGap / 2;
            const isrX = cx + barGap / 2;
            return (
              <g key={`group-${d.year}`}>
                {/* ZF bar */}
                {d.gtZF !== null && (
                  <>
                    <rect
                      x={zfX}
                      y={yScale(d.gtZF)}
                      width={barWidth}
                      height={yScale(0) - yScale(d.gtZF)}
                      fill="var(--viz-accent)"
                      fillOpacity={1}
                      rx={3}
                      style={{ cursor: "pointer", filter: d.year === activeYear ? "brightness(0.82)" : undefined }}
                      onMouseEnter={(e) => activateHover(e, d)}
                      onMouseMove={(e) => activateHover(e, d)}
                      onMouseLeave={() => setActiveYear(null)}
                    />
                    <text
                      x={zfX + barWidth / 2}
                      y={yScale(d.gtZF) - 6}
                      textAnchor="middle"
                      style={{
                        ...chartTextStyle,
                        fontSize: 10,
                        fill: d.year === 2024 ? "var(--viz-accent)" : "var(--text)",
                        fontWeight: d.year === 2024 ? 700 : undefined,
                      }}
                    >
                      {"\u20A1"}{d.gtZF}m
                    </text>
                  </>
                )}

                {/* ISR bar */}
                {d.gtISR !== null && (
                  <>
                    <rect
                      x={isrX}
                      y={yScale(d.gtISR)}
                      width={barWidth}
                      height={yScale(0) - yScale(d.gtISR)}
                      fill="var(--text-muted)"
                      fillOpacity={0.6}
                      rx={3}
                      style={{ cursor: "pointer", filter: d.year === activeYear ? "brightness(0.82)" : undefined }}
                      onMouseEnter={(e) => activateHover(e, d)}
                      onMouseMove={(e) => activateHover(e, d)}
                      onMouseLeave={() => setActiveYear(null)}
                    />
                    <text
                      x={isrX + barWidth / 2}
                      y={yScale(d.gtISR) - 6}
                      textAnchor="middle"
                      style={{ ...chartTextStyle, fontSize: 10, fill: "var(--text-muted)" }}
                    >
                      {"\u20A1"}{d.gtISR}m
                    </text>
                  </>
                )}

                {/* X axis label */}
                <text
                  x={cx}
                  y={HEIGHT - MARGIN.bottom + 22}
                  textAnchor="middle"
                  style={chartTextStyle}
                >
                  {d.year}
                </text>

              </g>
            );
          })}

          {/* Active highlight crosshair */}
          {activePoint && (() => {
            const ai = data.findIndex((d) => d.year === activePoint.year);
            return (
              <line
                x1={groupCenter(ai)}
                y1={MARGIN.top}
                x2={groupCenter(ai)}
                y2={HEIGHT - MARGIN.bottom}
                stroke="var(--viz-grid)"
                strokeWidth={1}
                opacity={0.48}
              />
            );
          })()}

          {/* Y axis labels */}
          {Y_TICKS.map((tick) => (
            <text
              key={`ylabel-${tick}`}
              x={MARGIN.left - 10}
              y={yScale(tick) + 4}
              textAnchor="end"
              style={chartTextStyle}
            >
              {"\u20A1"}{tick}m
            </text>
          ))}
        </svg>

        {activePoint && (
          <div
            style={{
              ...tooltipWrapStyle,
              left: `${tooltipX + (isRight ? -160 : 16)}px`,
              top: `${tooltipY - 10}px`,
            }}
          >
            <div style={{ fontSize: 13, color: "var(--text)", marginBottom: 6, fontWeight: 700 }}>{activePoint.year}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--viz-accent)", flexShrink: 0 }} />
              <span style={{ color: "var(--text-muted)", fontSize: 12, flexGrow: 1 }}>Exoneraciones ZF</span>
              <strong style={{ color: "var(--text)", fontSize: 12, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                {activePoint.gtZF !== null ? `\u20A1${activePoint.gtZF}m` : "n/d"}
              </strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-muted)", flexShrink: 0 }} />
              <span style={{ color: "var(--text-muted)", fontSize: 12, flexGrow: 1 }}>GT total ISR</span>
              <strong style={{ color: "var(--text)", fontSize: 12, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                {activePoint.gtISR !== null ? `\u20A1${activePoint.gtISR}m` : "n/d"}
              </strong>
            </div>
          </div>
        )}
      </div>

      <p
        style={{
          margin: "10px 0 0",
          fontSize: 11,
          color: "var(--text-muted)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {noteText}
      </p>

      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginTop: 12,
          fontSize: 10,
          textTransform: "uppercase",
          color: "var(--text-muted)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span>{footerSource}</span>
        <span>{footerProject}</span>
      </footer>
    </section>
  );
}
