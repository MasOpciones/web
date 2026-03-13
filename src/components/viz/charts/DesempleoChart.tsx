import React, { useMemo, useState, useRef } from "react";

type DesempleoPoint = {
  year: number;
  value: number;
};

const data: DesempleoPoint[] = [
  { year: 2010, value: 8.9 },
  { year: 2011, value: 10.3 },
  { year: 2012, value: 10.2 },
  { year: 2013, value: 9.4 },
  { year: 2014, value: 9.6 },
  { year: 2015, value: 9.6 },
  { year: 2016, value: 9.5 },
  { year: 2017, value: 9.1 },
  { year: 2018, value: 10.3 },
  { year: 2019, value: 11.8 },
  { year: 2020, value: 19.6 },
  { year: 2021, value: 16.4 },
  { year: 2022, value: 12.2 },
  { year: 2023, value: 8.9 },
  { year: 2024, value: 7.4 },
];

const WIDTH = 960;
const HEIGHT = 500;
const MARGIN = { top: 76, right: 190, bottom: 62, left: 64 };
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
const MIN_Y = 0;
const MAX_Y = 25;
const Y_TICKS = [5, 10, 15, 20, 25];
const X_TICKS = [2010, 2013, 2016, 2019, 2022, 2024];

const chartTextStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fill: "var(--text-muted)",
  fontSize: 11,
  fontVariantNumeric: "tabular-nums",
};

const tooltipWrapStyle: React.CSSProperties = {
  position: "absolute",
  minWidth: 172,
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
  background: "radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 8%, transparent), transparent 36%), linear-gradient(160deg, var(--viz-panel-strong) 0%, var(--viz-panel) 100%)",
  borderRadius: "16px",
  padding: "20px 16px 16px",
  border: "1px solid var(--border)",
  boxShadow: "var(--viz-shadow)",
};

function formatOne(value: number) {
  return value.toFixed(1);
}

function formatPct(value: number) {
  return `${value.toFixed(1)}%`;
}

function xScale(year: number) {
  const minYear = data[0].year;
  const maxYear = data[data.length - 1].year;
  return MARGIN.left + ((year - minYear) / (maxYear - minYear)) * INNER_WIDTH;
}

function yScale(value: number) {
  return MARGIN.top + ((MAX_Y - value) / (MAX_Y - MIN_Y)) * INNER_HEIGHT;
}

function buildLinePath(values: number[]) {
  return values
    .map((value, index) => {
      const prefix = index === 0 ? "M" : "L";
      return `${prefix} ${xScale(data[index].year).toFixed(2)} ${yScale(value).toFixed(2)}`;
    })
    .join(" ");
}

export default function DesempleoChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [tooltipX, setTooltipX] = useState(0);
  const [tooltipY, setTooltipY] = useState(0);
  const [isRight, setIsRight] = useState(false);

  const linePath = useMemo(() => buildLinePath(data.map((d) => d.value)), []);
  const last = data[data.length - 1];
  const peak = data.find((point) => point.year === 2020)!;
  const preCovid = data.find((point) => point.year === 2019)!;
  const activePoint = data.find((point) => point.year === activeYear) ?? null;

  const areaPath = `${linePath} L ${xScale(last.year).toFixed(2)} ${yScale(0).toFixed(2)} L ${xScale(
    data[0].year
  ).toFixed(2)} ${yScale(0).toFixed(2)} Z`;

  const handleMouseMove = (e: React.MouseEvent<SVGRectElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
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
    setTooltipY(e.clientY - rect.top);
    setIsRight(mouseX > rect.width / 2);
  };

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
          ACTO II · MERCADO LABORAL
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
          El desempleo tardó 14 años en alcanzar su mínimo
        </h3>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.45, maxWidth: "66ch" }}>
          Tasa de desempleo abierto anual promedio 2010–2024 (%)
        </p>
      </header>

      <div style={panelStyle}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          aria-label="Evolución anual de la tasa de desempleo abierto entre 2010 y 2024"
          role="img"
          style={{ display: "block", width: "100%", height: "auto" }}
        >
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

          <rect
            x={xScale(2010)}
            y={yScale(11.8)}
            width={xScale(2019) - xScale(2010)}
            height={yScale(8.9) - yScale(11.8)}
            fill="var(--viz-grid)"
            fillOpacity={0.15}
          />

          <path d={areaPath} fill="var(--viz-accent)" fillOpacity={0.08} />
          <path d={linePath} fill="none" stroke="var(--viz-accent)" strokeWidth={2.5} />

          <text
            x={xScale(peak.year) + 8}
            y={yScale(peak.value) - 10}
            style={{ ...chartTextStyle, fill: "var(--text)", fontWeight: 700 }}
          >
            Pico COVID: 19.6%
          </text>
          <text
            x={xScale(preCovid.year) + 8}
            y={yScale(preCovid.value) - 10}
            style={{ ...chartTextStyle, fill: "var(--text)", fontWeight: 700 }}
          >
            2019: 11.8% (con PIB creciendo)
          </text>
          <text
            x={xScale(last.year) + 10}
            y={yScale(last.value) + 4}
            style={{ ...chartTextStyle, fill: "var(--viz-accent)", fontWeight: 700 }}
          >
            Mínimo histórico: 7.4%
          </text>

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

          {Y_TICKS.map((tick) => (
            <text key={`ylabel-${tick}`} x={MARGIN.left - 10} y={yScale(tick) + 4} textAnchor="end" style={chartTextStyle}>
              {formatOne(tick)}
            </text>
          ))}

          {X_TICKS.map((tick) => (
            <text key={`xlabel-${tick}`} x={xScale(tick)} y={HEIGHT - MARGIN.bottom + 22} textAnchor="middle" style={chartTextStyle}>
              {tick}
            </text>
          ))}

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
              <span style={{ color: "var(--text-muted)", fontSize: 12, flexGrow: 1 }}>Desempleo</span>
              <strong style={{ color: "var(--text)", fontSize: 12, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                {formatPct(activePoint.value)}
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
        <span>FUENTE: INEC / BCCR</span>
        <span>PROYECTO: CR·PIB·ZONAS·FRANCAS</span>
      </footer>
    </section>
  );
}
