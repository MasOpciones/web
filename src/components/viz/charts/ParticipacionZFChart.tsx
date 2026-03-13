import React, { useMemo, useState, useRef } from "react";

type ParticipacionPoint = {
  year: number;
  value: number;
};

const data: ParticipacionPoint[] = [
  { year: 2000, value: 5.5 }, { year: 2001, value: 6.1 }, { year: 2002, value: 6.4 },
  { year: 2003, value: 6.8 }, { year: 2004, value: 7.2 }, { year: 2005, value: 7.8 },
  { year: 2006, value: 8.5 }, { year: 2007, value: 9.2 }, { year: 2008, value: 9.8 },
  { year: 2009, value: 10.1 }, { year: 2010, value: 10.8 }, { year: 2011, value: 11.4 },
  { year: 2012, value: 12.0 }, { year: 2013, value: 12.6 }, { year: 2014, value: 13.9 },
  { year: 2015, value: 15.8 }, { year: 2016, value: 17.2 }, { year: 2017, value: 19.1 },
  { year: 2018, value: 21.4 }, { year: 2019, value: 23.2 }, { year: 2020, value: 26.5 },
  { year: 2021, value: 28.9 }, { year: 2022, value: 30.8 }, { year: 2023, value: 32.4 },
  { year: 2024, value: 33.8 }, { year: 2025, value: 34.5 }, { year: 2026, value: 35.0 },
];

const WIDTH = 960;
const HEIGHT = 500;
const MARGIN = { top: 76, right: 120, bottom: 62, left: 72 };
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
const MIN_Y = 0;
const MAX_Y = 40;
const Y_TICKS = [0, 10, 20, 30, 40];
const X_TICKS = [2000, 2004, 2008, 2012, 2016, 2020, 2024, 2026];

const labelSalidaIntel = "Salida Intel";
const labelCovid = "COVID";
const label1de3 = "1 de cada 3";
const labelStart = "2000: 5.5%";
const labelEnd = "35%";
const eyebrow = "ACTO I \u00B7 ESTRUCTURA DEL PIB";
const title = "De 1 de cada 20 a 1 de cada 3";
const subtitle = "Participaci\u00F3n del r\u00E9gimen especial (zona franca) en el PIB encadenado, 2000\u20132026 (%)";
const footerSource = "FUENTE: BCCR, CUADRO 5787";
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
  background: "var(--viz-tooltip-bg)",
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

function xScale(year: number) {
  const minYear = data[0].year;
  const maxYear = data[data.length - 1].year;
  return MARGIN.left + ((year - minYear) / (maxYear - minYear)) * INNER_WIDTH;
}

function yScale(value: number) {
  return MARGIN.top + ((MAX_Y - value) / (MAX_Y - MIN_Y)) * INNER_HEIGHT;
}

function buildLinePath() {
  return data
    .map((d, i) => {
      const prefix = i === 0 ? "M" : "L";
      return `${prefix} ${xScale(d.year).toFixed(2)} ${yScale(d.value).toFixed(2)}`;
    })
    .join(" ");
}

function buildAreaPath() {
  const line = data
    .map((d, i) => {
      const prefix = i === 0 ? "M" : "L";
      return `${prefix} ${xScale(d.year).toFixed(2)} ${yScale(d.value).toFixed(2)}`;
    })
    .join(" ");
  const bottom = yScale(MIN_Y);
  return `${line} L ${xScale(data[data.length - 1].year).toFixed(2)} ${bottom.toFixed(2)} L ${xScale(data[0].year).toFixed(2)} ${bottom.toFixed(2)} Z`;
}

export default function ParticipacionZFChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [tooltipX, setTooltipX] = useState(0);
  const [tooltipY, setTooltipY] = useState(0);
  const [isRight, setIsRight] = useState(false);

  const linePath = useMemo(() => buildLinePath(), []);
  const areaPath = useMemo(() => buildAreaPath(), []);
  const activePoint = data.find((d) => d.year === activeYear) ?? null;

  const last = data[data.length - 1];
  const first = data[0];

  const handleMouseMove = (e: React.MouseEvent<SVGRectElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const scaleX = rect.width / WIDTH;
    const chartLeft = MARGIN.left * scaleX;
    const chartWidth = INNER_WIDTH * scaleX;
    const relativeX = mouseX - chartLeft;
    if (relativeX < 0 || relativeX > chartWidth) {
      setActiveYear(null);
      return;
    }
    const ratio = relativeX / chartWidth;
    const yearIndex = Math.round(ratio * (data.length - 1));
    const clampedIndex = Math.max(0, Math.min(data.length - 1, yearIndex));
    setActiveYear(data[clampedIndex].year);
    setTooltipX(mouseX);
    setTooltipY(mouseY);
    setIsRight(mouseX > rect.width / 2);
  };

  const covidX1 = xScale(2020);
  const covidX2 = xScale(2021);
  const intel2014X = xScale(2014);
  const ref33X1 = MARGIN.left;
  const ref33X2 = WIDTH - MARGIN.right;

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
      </header>

      <div style={panelStyle}>
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

          {/* COVID band */}
          <rect
            x={covidX1}
            y={MARGIN.top}
            width={covidX2 - covidX1}
            height={INNER_HEIGHT}
            fill="var(--viz-grid)"
            fillOpacity={0.15}
          />
          <text
            x={(covidX1 + covidX2) / 2}
            y={MARGIN.top + 14}
            textAnchor="middle"
            style={{ ...chartTextStyle, fontSize: 10, fill: "var(--text-muted)" }}
          >
            {labelCovid}
          </text>

          {/* Area fill */}
          <path d={areaPath} fill="var(--viz-accent)" fillOpacity={0.08} />

          {/* Line */}
          <path d={linePath} fill="none" stroke="var(--viz-accent)" strokeWidth={2.5} />

          {/* Vertical dashed line at 2014 (Salida Intel) */}
          <line
            x1={intel2014X}
            y1={MARGIN.top}
            x2={intel2014X}
            y2={HEIGHT - MARGIN.bottom}
            stroke="var(--viz-grid)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <text
            x={intel2014X - 6}
            y={MARGIN.top + 14}
            textAnchor="end"
            style={{ ...chartTextStyle, fontSize: 10, fill: "var(--text-muted)" }}
          >
            {labelSalidaIntel}
          </text>

          {/* Reference line at y=33.3 */}
          <line
            x1={ref33X1}
            y1={yScale(33.3)}
            x2={ref33X2}
            y2={yScale(33.3)}
            stroke="var(--viz-grid)"
            strokeDasharray="2 4"
          />

          {/* Static label at 2000 */}
          <text
            x={xScale(first.year) + 8}
            y={yScale(first.value) + 18}
            style={{ ...chartTextStyle, fill: "var(--text-muted)", fontWeight: 700 }}
          >
            {labelStart}
          </text>

          {/* End label at 2026 */}
          <text
            x={xScale(last.year) + 10}
            y={yScale(last.value) + 4}
            style={{ ...chartTextStyle, fill: "var(--viz-accent)", fontWeight: 700 }}
          >
            {labelEnd}
          </text>

          {/* Active hover indicator */}
          {activePoint && (
            <>
              <line
                x1={xScale(activePoint.year)}
                y1={MARGIN.top}
                x2={xScale(activePoint.year)}
                y2={HEIGHT - MARGIN.bottom}
                stroke="var(--viz-grid)"
                strokeWidth={1}
                opacity={0.48}
              />
              <circle cx={xScale(activePoint.year)} cy={yScale(activePoint.value)} r={7} fill="var(--viz-accent)" fillOpacity={0.14} />
              <circle cx={xScale(activePoint.year)} cy={yScale(activePoint.value)} r={2.8} fill="var(--viz-accent)" />
            </>
          )}

          {/* Y axis labels */}
          {Y_TICKS.map((tick) => (
            <text key={`ylabel-${tick}`} x={MARGIN.left - 10} y={yScale(tick) + 4} textAnchor="end" style={chartTextStyle}>
              {tick}%
            </text>
          ))}

          {/* X axis labels */}
          {X_TICKS.map((tick) => (
            <text key={`xlabel-${tick}`} x={xScale(tick)} y={HEIGHT - MARGIN.bottom + 22} textAnchor="middle" style={chartTextStyle}>
              {tick}
            </text>
          ))}

          {/* Mouse capture rect */}
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={INNER_WIDTH}
            height={INNER_HEIGHT}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setActiveYear(null)}
          />
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
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--viz-accent)", flexShrink: 0 }} />
              <span style={{ color: "var(--text-muted)", fontSize: 12, flexGrow: 1 }}>Participación ZF</span>
              <strong style={{ color: "var(--text)", fontSize: 12, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                {activePoint.value.toFixed(1)}%
              </strong>
            </div>
          </div>
        )}
      </div>

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
