import React, { useState, useRef } from "react";

type CanastaPoint = {
  year: number;
  cba: number;
  ipc: number;
};

const data: CanastaPoint[] = [
  { year: 2016, cba: -1.1, ipc: 0.8 },
  { year: 2017, cba: 1.8, ipc: 2.6 },
  { year: 2018, cba: 1.8, ipc: 2.0 },
  { year: 2019, cba: 0.6, ipc: 1.5 },
  { year: 2020, cba: 0.3, ipc: 0.9 },
  { year: 2021, cba: 2.5, ipc: 3.3 },
  { year: 2022, cba: 16.2, ipc: 7.9 },
  { year: 2023, cba: 3.4, ipc: -1.8 },
  { year: 2024, cba: -2.1, ipc: 0.8 },
];

const WIDTH = 960;
const HEIGHT = 500;
const MARGIN = { top: 80, right: 120, bottom: 74, left: 64 };
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
const MIN_Y = -4;
const MAX_Y = 18;
const Y_TICKS = [-4, 0, 4, 8, 12, 16];
const LEGEND_SIZE = 10;

const chartTextStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fill: "var(--text-muted)",
  fontSize: 11,
  fontVariantNumeric: "tabular-nums",
};

const tooltipWrapStyle: React.CSSProperties = {
  position: "absolute",
  minWidth: 148,
  background: "var(--viz-tooltip-bg-bar)",
  border: "1px solid var(--viz-tooltip-border)",
  borderRadius: 6,
  padding: "7px 10px",
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

function formatSignedPct(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function yScale(value: number) {
  return MARGIN.top + ((MAX_Y - value) / (MAX_Y - MIN_Y)) * INNER_HEIGHT;
}

function groupCenter(index: number) {
  const groupWidth = INNER_WIDTH / data.length;
  return MARGIN.left + groupWidth * (index + 0.5);
}

function barRect(value: number, x: number, width: number) {
  const yZero = yScale(0);
  if (value >= 0) {
    const yTop = yScale(value);
    return { x, y: yTop, width, height: yZero - yTop };
  }
  return { x, y: yZero, width, height: yScale(value) - yZero };
}


export default function CanastaSalarioChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [activeSeries, setActiveSeries] = useState<"cba" | "ipc" | null>(null);
  const [tooltipX, setTooltipX] = useState(0);
  const [tooltipY, setTooltipY] = useState(0);
  const [isRight, setIsRight] = useState(false);

  const groupWidth = INNER_WIDTH / data.length;
  const barWidth = Math.min(24, groupWidth * 0.34);
  const barGap = 5;
  const activePoint = data.find((point) => point.year === activeYear) ?? null;
  const activeColor = activeSeries === "ipc" ? "var(--text-muted)" : "var(--viz-accent)";

  // SVG-space coords for the hover dot
  const activeIndex = activeYear !== null ? data.findIndex((d) => d.year === activeYear) : -1;
  const activeCenter = activeIndex >= 0 ? groupCenter(activeIndex) : 0;
  const activeDotSvgX =
    activeSeries === "cba"
      ? activeCenter - barWidth - barGap / 2 + barWidth / 2
      : activeCenter + barGap / 2 + barWidth / 2;
  const activeDotSvgY =
    activePoint && activeSeries ? yScale(activePoint[activeSeries]) : 0;

  function activateHover(
    e: React.MouseEvent,
    point: CanastaPoint,
    series: "cba" | "ipc"
  ) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setActiveYear(point.year);
    setActiveSeries(series);
    setTooltipX(mouseX);
    setTooltipY(mouseY);
    setIsRight(mouseX > rect.width / 2);
  }

  return (
    <section style={sectionStyle}>
      <header style={{ marginBottom: 14 }}>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            fontWeight: 700,
          }}
        >
          ACTO II · COSTO DE VIDA
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
          2022: el año en que la inflación se comió el salario
        </h3>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>
          Variación % anual: canasta básica alimentaria vs IPC
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--viz-accent)", flexShrink: 0 }} />
            Canasta básica alimentaria
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-muted)", flexShrink: 0 }} />
            IPC general
          </span>
        </div>
      </header>

      <div
        style={panelStyle}
        onMouseLeave={() => { setActiveYear(null); setActiveSeries(null); }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          aria-label="Comparación anual entre variación de canasta básica alimentaria e IPC entre 2016 y 2024"
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

          <line
            x1={MARGIN.left}
            y1={yScale(0)}
            x2={WIDTH - MARGIN.right}
            y2={yScale(0)}
            stroke="var(--border)"
            strokeWidth={1.2}
          />

          {data.map((point, index) => {
            const center = groupCenter(index);
            const cbaRect = barRect(point.cba, center - barWidth - barGap / 2, barWidth);
            const ipcRect = barRect(point.ipc, center + barGap / 2, barWidth);
            return (
              <g key={`bars-${point.year}`}>
                <rect
                  x={cbaRect.x} y={cbaRect.y} width={cbaRect.width} height={cbaRect.height}
                  fill="var(--viz-accent)" fillOpacity={0.9}
                  style={{ cursor: "pointer", filter: activeYear === point.year && activeSeries === "cba" ? "brightness(0.82)" : undefined }}
                  onMouseEnter={(e) => activateHover(e, point, "cba")}
                  onMouseMove={(e) => activateHover(e, point, "cba")}
                  onMouseLeave={() => { setActiveYear(null); setActiveSeries(null); }}
                />
                <rect
                  x={ipcRect.x} y={ipcRect.y} width={ipcRect.width} height={ipcRect.height}
                  fill="var(--text-muted)" fillOpacity={0.5}
                  style={{ cursor: "pointer", filter: activeYear === point.year && activeSeries === "ipc" ? "brightness(0.82)" : undefined }}
                  onMouseEnter={(e) => activateHover(e, point, "ipc")}
                  onMouseMove={(e) => activateHover(e, point, "ipc")}
                  onMouseLeave={() => { setActiveYear(null); setActiveSeries(null); }}
                />

                <text
                  x={cbaRect.x + cbaRect.width / 2}
                  y={point.cba >= 0 ? cbaRect.y - 6 : cbaRect.y + cbaRect.height + 12}
                  textAnchor="middle"
                  style={{ ...chartTextStyle, fill: "var(--text)" }}
                >
                  {formatSignedPct(point.cba)}
                </text>
                <text
                  x={ipcRect.x + ipcRect.width / 2}
                  y={point.ipc >= 0 ? ipcRect.y - 6 : ipcRect.y + ipcRect.height + 12}
                  textAnchor="middle"
                  style={{ ...chartTextStyle, fill: "var(--text-muted)" }}
                >
                  {formatSignedPct(point.ipc)}
                </text>

                <text x={center} y={HEIGHT - MARGIN.bottom + 22} textAnchor="middle" style={chartTextStyle}>
                  {point.year}
                </text>

              </g>
            );
          })}

          <text
            x={groupCenter(6) + 12}
            y={yScale(16.2) - 12}
            style={{ ...chartTextStyle, fill: "var(--text)", fontWeight: 700 }}
          >
            CBA +16.2% / IPC +7.9%
          </text>

          {activePoint && (
            <>
              <line
                x1={activeDotSvgX}
                y1={MARGIN.top}
                x2={activeDotSvgX}
                y2={HEIGHT - MARGIN.bottom}
                stroke="var(--viz-grid)"
                strokeWidth={1}
                opacity={0.48}
              />
              <circle cx={activeDotSvgX} cy={activeDotSvgY} r={7} fill={activeColor} fillOpacity={0.14} />
              <circle cx={activeDotSvgX} cy={activeDotSvgY} r={2.8} fill={activeColor} />
            </>
          )}

          {Y_TICKS.map((tick) => (
            <text key={`ylabel-${tick}`} x={MARGIN.left - 10} y={yScale(tick) + 4} textAnchor="end" style={chartTextStyle}>
              {formatOne(tick)}
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
            <div style={{ fontSize: 11, color: "var(--text)", marginBottom: 5, fontWeight: 700 }}>{activePoint.year}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--viz-accent)", flexShrink: 0 }} />
              <span style={{ color: "var(--text-muted)", fontSize: 11, flexGrow: 1 }}>CBA</span>
              <strong style={{ color: "var(--text)", fontSize: 11, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                {formatSignedPct(activePoint.cba)}
              </strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--text-muted)", flexShrink: 0 }} />
              <span style={{ color: "var(--text-muted)", fontSize: 11, flexGrow: 1 }}>IPC</span>
              <strong style={{ color: "var(--text)", fontSize: 11, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                {formatSignedPct(activePoint.ipc)}
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
        Nota: CBA acumuló +24.6% entre 2015 y 2024; IPC +19.2%.
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
        <span>FUENTE: INEC / BCCR</span>
        <span>PROYECTO: CR·PIB·ZONAS·FRANCAS</span>
      </footer>
    </section>
  );
}
