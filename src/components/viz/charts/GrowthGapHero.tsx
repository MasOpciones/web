import React, { useMemo, useState, useRef } from "react";

type GrowthPoint = {
  year: number;
  special: number;
  total: number;
  definitivo: number;
};

const data: GrowthPoint[] = [
  { year: 2000, special: 100,  total: 100, definitivo: 100 },
  { year: 2002, special: 145,  total: 112, definitivo: 108 },
  { year: 2004, special: 240,  total: 132, definitivo: 126 },
  { year: 2006, special: 360,  total: 156, definitivo: 148 },
  { year: 2008, special: 470,  total: 179, definitivo: 166 },
  { year: 2009, special: 470,  total: 182, definitivo: 168 },
  { year: 2010, special: 530,  total: 194, definitivo: 176 },
  { year: 2012, special: 650,  total: 217, definitivo: 191 },
  { year: 2013, special: 690,  total: 226, definitivo: 198 },
  { year: 2014, special: 770,  total: 238, definitivo: 208 },
  { year: 2016, special: 860,  total: 264, definitivo: 228 },
  { year: 2017, special: 960,  total: 279, definitivo: 239 },
  { year: 2018, special: 1030, total: 293, definitivo: 247 },
  { year: 2019, special: 1120, total: 307, definitivo: 255 },
  { year: 2020, special: 1260, total: 299, definitivo: 246 },
  { year: 2021, special: 1340, total: 316, definitivo: 258 },
  { year: 2022, special: 1450, total: 334, definitivo: 269 },
  { year: 2023, special: 1540, total: 351, definitivo: 280 },
  { year: 2024, special: 1610, total: 366, definitivo: 289 },
  { year: 2025, special: 1680, total: 378, definitivo: 296 },
];

const WIDTH = 960;
const HEIGHT = 520;
const MARGIN = { top: 76, right: 80, bottom: 62, left: 72 };
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
const MIN_Y = 0;
const MAX_Y = 1800;
const Y_TICKS = [0, 300, 600, 900, 1200, 1500];
const X_TICKS = [2000, 2004, 2008, 2012, 2016, 2020, 2024];
const HIGHLIGHT_YEARS = [2010, 2017, 2019, 2025];

const chartTextStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fill: "var(--text-muted)",
  fontSize: 11,
  fontVariantNumeric: "tabular-nums",
};

const tooltipWrapStyle: React.CSSProperties = {
  position: "absolute",
  minWidth: 210,
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

function buildLinePath(values: number[]) {
  return values
    .map((value, index) => {
      const prefix = index === 0 ? "M" : "L";
      return `${prefix} ${xScale(data[index].year).toFixed(2)} ${yScale(value).toFixed(2)}`;
    })
    .join(" ");
}

function buildAreaPath(values: number[]) {
  const line = buildLinePath(values);
  const bottom = yScale(MIN_Y);
  return `${line} L ${xScale(data[data.length - 1].year).toFixed(2)} ${bottom.toFixed(2)} L ${xScale(data[0].year).toFixed(2)} ${bottom.toFixed(2)} Z`;
}

export default function GrowthGapHero() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [tooltipX, setTooltipX] = useState(0);
  const [tooltipY, setTooltipY] = useState(0);
  const [isRight, setIsRight] = useState(false);

  const specialPath = useMemo(() => buildLinePath(data.map((d) => d.special)), []);
  const totalPath = useMemo(() => buildLinePath(data.map((d) => d.total)), []);
  const definitivoPath = useMemo(() => buildLinePath(data.map((d) => d.definitivo)), []);
  const areaPath = useMemo(() => buildAreaPath(data.map((d) => d.special)), []);

  const activePoint = data.find((d) => d.year === activeYear) ?? null;
  const last = data[data.length - 1];

  const specialLabelY = yScale(last.special) + 4;
  const totalLabelY = yScale(last.total) + 4;
  let definitivoLabelY = yScale(last.definitivo) + 4;
  if (Math.abs(definitivoLabelY - totalLabelY) < 14) {
    definitivoLabelY = totalLabelY + 14;
  }

  const covidX1 = xScale(2020);
  const covidX2 = xScale(2021);

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

  return (
    <section style={sectionStyle}>
      <header style={{ marginBottom: 18 }}>
        <p style={{
          margin: 0,
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          fontWeight: 700,
        }}>
          ACTO I · CRECIMIENTO ACUMULADO
        </p>
        <h3 style={{
          fontSize: "clamp(1.4rem, 3vw, 2rem)",
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: "var(--text)",
          margin: "4px 0 6px",
        }}>
          13× en 25 años
        </h3>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.45, maxWidth: "66ch" }}>
          Índice de crecimiento acumulado · base 100 · año 2000 · volumen encadenado
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
            <span style={{ width: 10, height: 2, background: "var(--viz-accent)", flexShrink: 0 }} />
            Régimen especial (zona franca)
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
            <span style={{ width: 10, height: 2, background: "var(--text-muted)", flexShrink: 0 }} />
            PIB total
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
            <span style={{ width: 10, height: 2, background: "var(--text-muted)", flexShrink: 0, opacity: 0.45 }} />
            Régimen definitivo
          </span>
        </div>
      </header>

      <div style={panelStyle}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          aria-label="Comparación de crecimiento acumulado entre régimen especial, PIB total y régimen definitivo desde 2000"
          role="img"
          style={{ display: "block", width: "100%", height: "auto" }}
        >
          <defs>
            <filter id="ggGlow" x="-10%" y="-40%" width="120%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id="ggClip">
              <rect x={MARGIN.left} y={MARGIN.top} width={INNER_WIDTH} height={INNER_HEIGHT} />
            </clipPath>
          </defs>

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
            style={{ ...chartTextStyle, fontSize: 10 }}
          >
            COVID
          </text>

          {/* Area fill — clipped */}
          <path d={areaPath} fill="var(--viz-accent)" fillOpacity={0.07} clipPath="url(#ggClip)" />

          {/* Secondary lines — clipped */}
          <path d={definitivoPath} fill="none" stroke="var(--text-muted)" strokeWidth={1.5} strokeDasharray="4 3" strokeOpacity={0.45} clipPath="url(#ggClip)" />
          <path d={totalPath} fill="none" stroke="var(--text-muted)" strokeWidth={1.5} clipPath="url(#ggClip)" />

          {/* Special line: glow + main — clipped */}
          <g clipPath="url(#ggClip)">
            <path d={specialPath} fill="none" stroke="var(--viz-accent)" strokeWidth={2.5} strokeOpacity={0.35} filter="url(#ggGlow)" />
            <path d={specialPath} fill="none" stroke="var(--viz-accent)" strokeWidth={2.5} />
          </g>

          {/* Post-Intel annotation */}
          <line
            x1={xScale(2017)}
            y1={yScale(1050)}
            x2={xScale(2017)}
            y2={HEIGHT - MARGIN.bottom}
            stroke="var(--viz-grid)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <text
            x={xScale(2017) - 6}
            y={yScale(1050) - 10}
            textAnchor="end"
            style={{ ...chartTextStyle, fontSize: 10 }}
          >
            Post-Intel boom tech
          </text>

          {/* Highlight points */}
          {data.filter((d) => HIGHLIGHT_YEARS.includes(d.year)).map((d) => (
            <g key={`point-${d.year}`}>
              <circle cx={xScale(d.year)} cy={yScale(d.special)} r={7} fill="none" stroke="var(--viz-accent)" strokeWidth={1.5} />
              <circle cx={xScale(d.year)} cy={yScale(d.special)} r={3.5} fill="var(--viz-accent)" />
            </g>
          ))}

          {/* Active hover */}
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
              <circle cx={xScale(activePoint.year)} cy={yScale(activePoint.special)} r={7} fill="var(--viz-accent)" fillOpacity={0.14} />
              <circle cx={xScale(activePoint.year)} cy={yScale(activePoint.special)} r={2.8} fill="var(--viz-accent)" />
              <circle cx={xScale(activePoint.year)} cy={yScale(activePoint.total)} r={6} fill="var(--text-muted)" fillOpacity={0.14} />
              <circle cx={xScale(activePoint.year)} cy={yScale(activePoint.total)} r={2.5} fill="var(--text-muted)" />
              <circle cx={xScale(activePoint.year)} cy={yScale(activePoint.definitivo)} r={5} fill="var(--text-muted)" fillOpacity={0.1} />
              <circle cx={xScale(activePoint.year)} cy={yScale(activePoint.definitivo)} r={2} fill="var(--text-muted)" />
            </>
          )}

          {/* End labels */}
          <text x={xScale(last.year) + 10} y={specialLabelY} style={{ ...chartTextStyle, fill: "var(--viz-accent)", fontWeight: 700 }}>
            {last.special.toLocaleString("en-US")}
          </text>
          <text x={xScale(last.year) + 10} y={totalLabelY} style={{ ...chartTextStyle, fill: "var(--text-muted)", fontWeight: 700 }}>
            {last.total}
          </text>
          <text x={xScale(last.year) + 10} y={definitivoLabelY} style={{ ...chartTextStyle, fill: "var(--text-muted)" }}>
            {last.definitivo}
          </text>

          {/* Y axis labels */}
          {Y_TICKS.map((tick) => (
            <text key={`ylabel-${tick}`} x={MARGIN.left - 10} y={yScale(tick) + 4} textAnchor="end" style={chartTextStyle}>
              {tick}
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
              left: `${tooltipX + (isRight ? -220 : 16)}px`,
              top: `${tooltipY - 10}px`,
            }}
          >
            <div style={{ fontSize: 13, color: "var(--text)", marginBottom: 6, fontWeight: 700 }}>{activePoint.year}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--viz-accent)", flexShrink: 0 }} />
              <span style={{ color: "var(--text-muted)", fontSize: 12, flexGrow: 1 }}>Régimen especial</span>
              <strong style={{ color: "var(--text)", fontSize: 12, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                {activePoint.special.toLocaleString("en-US")}
              </strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-muted)", flexShrink: 0 }} />
              <span style={{ color: "var(--text-muted)", fontSize: 12, flexGrow: 1 }}>PIB total</span>
              <strong style={{ color: "var(--text)", fontSize: 12, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                {activePoint.total}
              </strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-muted)", flexShrink: 0, opacity: 0.5 }} />
              <span style={{ color: "var(--text-muted)", fontSize: 12, flexGrow: 1 }}>Régimen definitivo</span>
              <strong style={{ color: "var(--text)", fontSize: 12, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                {activePoint.definitivo}
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
        <span>FUENTE: BCCR, CUADRO 5787</span>
        <span>PROYECTO: CR·PIB·ZONAS·FRANCAS</span>
      </footer>
    </section>
  );
}
