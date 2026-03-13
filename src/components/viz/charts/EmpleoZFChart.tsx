import React, { useState, useRef } from "react";

type EmpleoPoint = {
  year: number;
  empleos: number;
  pct: number;
};

const data: EmpleoPoint[] = [
  { year: 2015, empleos: 82086,  pct: 4.0 },
  { year: 2018, empleos: 119450, pct: 5.6 },
  { year: 2019, empleos: 130116, pct: 6.0 },
  { year: 2020, empleos: 144201, pct: 7.8 },
  { year: 2021, empleos: 164212, pct: 8.1 },
  { year: 2022, empleos: 184035, pct: 8.4 },
];

const WIDTH = 960;
const HEIGHT = 500;
const MARGIN = { top: 76, right: 80, bottom: 62, left: 80 };
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

const eyebrow = "ACTO III \u00B7 EMPLEO";
const title = "Zona franca: 8 de cada 100 empleos";
const subtitle = "Empleo directo en r\u00E9gimen especial y participaci\u00F3n en el empleo total, 2015\u20132022";
const legendBar = "Empleos directos ZF";
const legendLine = "% del empleo total";
const annotationNoData = "2016 y 2017 sin datos disponibles";
const footerSource = "FUENTE: PROCOMER, BALANCE ZF 2022";
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

function yLeft(v: number) {
  return MARGIN.top + (1 - v / 200000) * INNER_HEIGHT;
}

function yRight(v: number) {
  return MARGIN.top + (1 - v / 10) * INNER_HEIGHT;
}

const LEFT_TICKS = [0, 50000, 100000, 150000, 200000];
const RIGHT_TICKS = [0, 2, 4, 6, 8, 10];

export default function EmpleoZFChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [tooltipX, setTooltipX] = useState(0);
  const [tooltipY, setTooltipY] = useState(0);
  const [isRight, setIsRight] = useState(false);

  const activePoint = data.find((d) => d.year === activeYear) ?? null;

  const groupWidth = INNER_WIDTH / data.length;
  const barWidth = Math.min(48, groupWidth * 0.55);

  function activateHover(e: React.MouseEvent, d: EmpleoPoint) {
    if (!svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    setActiveYear(d.year);
    setTooltipX(e.clientX - svgRect.left);
    setTooltipY(e.clientY - svgRect.top);
    setIsRight((e.clientX - svgRect.left) > svgRect.width / 2);
  }

  const linePath = data
    .map((d, i) => {
      const prefix = i === 0 ? "M" : "L";
      return `${prefix} ${groupCenter(i).toFixed(2)} ${yRight(d.pct).toFixed(2)}`;
    })
    .join(" ");

  const midX = (groupCenter(0) + groupCenter(1)) / 2;

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
            {legendBar}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
            <span style={{ width: 10, height: 2, background: "var(--text-muted)", flexShrink: 0 }} />
            {legendLine}
          </span>
        </div>
      </header>

      <div style={panelStyle}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          aria-label={subtitle}
          role="img"
          style={{ display: "block", width: "100%", height: "auto" }}
          onMouseLeave={() => setActiveYear(null)}
        >
          {/* Grid lines from left axis */}
          <g>
            {LEFT_TICKS.map((tick) => (
              <line
                key={`grid-${tick}`}
                x1={MARGIN.left}
                y1={yLeft(tick)}
                x2={WIDTH - MARGIN.right}
                y2={yLeft(tick)}
                stroke="var(--viz-grid)"
                strokeWidth={1}
                opacity={0.65}
              />
            ))}
          </g>

          {/* Bars */}
          {data.map((d, i) => {
            const cx = groupCenter(i);
            const x = cx - barWidth / 2;
            const barH = yLeft(0) - yLeft(d.empleos);
            const y = yLeft(d.empleos);
            const isActive = d.year === activeYear;
            return (
              <g key={`bar-${d.year}`}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  fill="var(--viz-accent)"
                  fillOpacity={1}
                  rx={3}
                  style={{ cursor: "pointer", filter: isActive ? "brightness(0.82)" : undefined }}
                  onMouseEnter={(e) => activateHover(e, d)}
                  onMouseMove={(e) => activateHover(e, d)}
                  onMouseLeave={() => setActiveYear(null)}
                />
                <text
                  x={cx}
                  y={y - 6}
                  textAnchor="middle"
                  style={{ ...chartTextStyle, fontSize: 10, fill: "var(--text)" }}
                >
                  {d.empleos.toLocaleString("en-US")}
                </text>
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

          {/* Line (pct, right axis) */}
          <path d={linePath} fill="none" stroke="var(--text-muted)" strokeWidth={2} />

          {/* Dots on line */}
          {data.map((d, i) => (
            <g key={`dot-${d.year}`}>
              <circle cx={groupCenter(i)} cy={yRight(d.pct)} r={4} fill="var(--text-muted)" />
              <circle
                cx={groupCenter(i)}
                cy={yRight(d.pct)}
                r={10}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => activateHover(e, d)}
                onMouseMove={(e) => activateHover(e, d)}
                onMouseLeave={() => setActiveYear(null)}
              />
            </g>
          ))}

          {/* Active highlight */}
          {activePoint && (() => {
            const ai = data.findIndex((d) => d.year === activePoint.year);
            return (
              <>
                <line
                  x1={groupCenter(ai)}
                  y1={MARGIN.top}
                  x2={groupCenter(ai)}
                  y2={HEIGHT - MARGIN.bottom}
                  stroke="var(--viz-grid)"
                  strokeWidth={1}
                  opacity={0.48}
                />
                <circle cx={groupCenter(ai)} cy={yRight(activePoint.pct)} r={7} fill="var(--text-muted)" fillOpacity={0.14} />
                <circle cx={groupCenter(ai)} cy={yRight(activePoint.pct)} r={2.8} fill="var(--text-muted)" />
              </>
            );
          })()}

          {/* Left Y axis labels */}
          {LEFT_TICKS.map((tick) => (
            <text
              key={`ylabel-left-${tick}`}
              x={MARGIN.left - 10}
              y={yLeft(tick) + 4}
              textAnchor="end"
              style={chartTextStyle}
            >
              {tick.toLocaleString("en-US")}
            </text>
          ))}

          {/* Right Y axis labels + tick marks */}
          {RIGHT_TICKS.map((tick) => (
            <g key={`ylabel-right-${tick}`}>
              <line
                x1={WIDTH - MARGIN.right}
                y1={yRight(tick)}
                x2={WIDTH - MARGIN.right + 5}
                y2={yRight(tick)}
                stroke="var(--viz-grid)"
                strokeWidth={1}
              />
              <text
                x={WIDTH - MARGIN.right + 12}
                y={yRight(tick) + 4}
                textAnchor="start"
                style={chartTextStyle}
              >
                {tick}%
              </text>
            </g>
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
              <span style={{ color: "var(--text-muted)", fontSize: 12, flexGrow: 1 }}>Empleos directos</span>
              <strong style={{ color: "var(--text)", fontSize: 12, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                {activePoint.empleos.toLocaleString("en-US")}
              </strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-muted)", flexShrink: 0 }} />
              <span style={{ color: "var(--text-muted)", fontSize: 12, flexGrow: 1 }}>% empleo total</span>
              <strong style={{ color: "var(--text)", fontSize: 12, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                {activePoint.pct.toFixed(1)}%
              </strong>
            </div>
          </div>
        )}
      </div>

      <p style={{ margin: "8px 0 0", fontSize: 10, color: "var(--text-muted)" }}>
        {annotationNoData}
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
