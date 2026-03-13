import React, { useMemo, useState, useRef } from "react";

type SalarioPoint = {
  year: number;
  privado: number;
  publico: number;
};

const data: SalarioPoint[] = [
  { year: 2010, privado: 100.0, publico: 100.0 },
  { year: 2011, privado: 95.1, publico: 97.9 },
  { year: 2012, privado: 86.2, publico: 96.2 },
  { year: 2013, privado: 86.0, publico: 102.1 },
  { year: 2014, privado: 89.6, publico: 102.5 },
  { year: 2015, privado: 94.9, publico: 111.2 },
  { year: 2016, privado: 98.7, publico: 111.5 },
  { year: 2017, privado: 95.5, publico: 106.9 },
  { year: 2018, privado: 92.6, publico: 109.6 },
  { year: 2019, privado: 90.3, publico: 112.8 },
  { year: 2020, privado: 81.4, publico: 111.1 },
  { year: 2021, privado: 88.2, publico: 107.0 },
  { year: 2022, privado: 86.7, publico: 98.5 },
  { year: 2023, privado: 92.6, publico: 91.7 },
  { year: 2024, privado: 98.0, publico: 97.5 },
];

const WIDTH = 960;
const HEIGHT = 500;
const MARGIN = { top: 76, right: 170, bottom: 62, left: 64 };
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
const MIN_Y = 75;
const MAX_Y = 120;
const Y_TICKS = [80, 90, 100, 110, 120];
const X_TICKS = [2010, 2014, 2018, 2022, 2024];
const HIGHLIGHT_YEAR = 2022;

const chartTextStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fill: "var(--text-muted)",
  fontSize: 11,
  fontVariantNumeric: "tabular-nums",
};

const tooltipWrapStyle: React.CSSProperties = {
  position: "absolute",
  minWidth: 194,
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

export default function SalarioRealChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [activeSeries, setActiveSeries] = useState<"privado" | "publico" | null>(null);
  const [tooltipX, setTooltipX] = useState(0);
  const [tooltipY, setTooltipY] = useState(0);
  const [isRight, setIsRight] = useState(false);

  const privadoPath = useMemo(() => buildLinePath(data.map((d) => d.privado)), []);
  const publicoPath = useMemo(() => buildLinePath(data.map((d) => d.publico)), []);
  const activePoint = data.find((d) => d.year === activeYear) ?? null;

  const privateEnd = data[data.length - 1];
  const highlight = data.find((point) => point.year === HIGHLIGHT_YEAR)!;
  const rightLabelX = xScale(privateEnd.year) + 14;
  const privateLabelY = yScale(privateEnd.privado) + 3;
  let publicLabelY = yScale(privateEnd.publico) + 3;
  if (Math.abs(publicLabelY - privateLabelY) < 14) {
    publicLabelY = privateLabelY + 14;
  }
  let levelLabelY = yScale(100) - 9;
  if (Math.abs(levelLabelY - publicLabelY) < 13) {
    levelLabelY = publicLabelY - 13;
  }

  // SVG-space coords for crosshair
  const hoverSvgX = activePoint ? xScale(activePoint.year) : 0;
  const hoverSvgY =
    activePoint && activeSeries ? yScale(activePoint[activeSeries]) : 0;

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
    const point = data[clampedIndex];
    // Determine closest series by mouse Y in SVG space
    const svgMouseY = (mouseY / rect.height) * HEIGHT;
    const distPrivado = Math.abs(svgMouseY - yScale(point.privado));
    const distPublico = Math.abs(svgMouseY - yScale(point.publico));
    setActiveSeries(distPrivado <= distPublico ? "privado" : "publico");
    setActiveYear(point.year);
    setTooltipX(mouseX);
    setTooltipY(mouseY);
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
          ACTO II · SALARIOS
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
          15 años para no avanzar nada
        </h3>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.45, maxWidth: "66ch" }}>
          Ingreso promedio mensual real, índice base 2010 = 100
        </p>
      </header>

      <div style={panelStyle}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          aria-label="Evolución del ingreso mensual real en el sector privado y público entre 2010 y 2024"
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
            y1={yScale(100)}
            x2={WIDTH - MARGIN.right}
            y2={yScale(100)}
            stroke="var(--viz-grid)"
            strokeWidth={1}
            strokeDasharray="2 4"
          />

          <text
            x={WIDTH - MARGIN.right + 8}
            y={levelLabelY}
            style={{ ...chartTextStyle, fill: "var(--text-muted)" }}
          >
            Nivel 2010
          </text>

          <path d={publicoPath} fill="none" stroke="var(--text-muted)" strokeWidth={1.5} strokeDasharray="4 3" />
          <path d={privadoPath} fill="none" stroke="var(--viz-accent)" strokeWidth={2.5} />

          <g>
            <circle cx={xScale(highlight.year)} cy={yScale(highlight.privado)} r={7} fill="none" stroke="var(--viz-accent)" strokeWidth={1.5} />
            <circle cx={xScale(highlight.year)} cy={yScale(highlight.privado)} r={4} fill="var(--viz-accent)" />
            <text
              x={xScale(highlight.year) + 10}
              y={yScale(highlight.privado) - 10}
              style={{ ...chartTextStyle, fill: "var(--viz-accent)", fontWeight: 700 }}
            >
              Piso: 86.7
            </text>
          </g>

          <line
            x1={xScale(privateEnd.year) + 2}
            y1={yScale(privateEnd.privado)}
            x2={rightLabelX - 5}
            y2={privateLabelY - 4}
            stroke="var(--viz-accent)"
            strokeOpacity={0.45}
            strokeWidth={1}
          />
          <line
            x1={xScale(privateEnd.year) + 2}
            y1={yScale(privateEnd.publico)}
            x2={rightLabelX - 5}
            y2={publicLabelY - 4}
            stroke="var(--text-muted)"
            strokeOpacity={0.45}
            strokeWidth={1}
          />
          <text x={rightLabelX} y={privateLabelY} style={{ ...chartTextStyle, fill: "var(--viz-accent)", fontWeight: 700 }}>
            Privado 98.0
          </text>
          <text x={rightLabelX} y={publicLabelY} style={{ ...chartTextStyle, fill: "var(--text-muted)", fontWeight: 700 }}>
            Público 97.5
          </text>

          {activePoint && (
            <>
              <line
                x1={hoverSvgX}
                y1={MARGIN.top}
                x2={hoverSvgX}
                y2={HEIGHT - MARGIN.bottom}
                stroke="var(--viz-grid)"
                strokeWidth={1}
                opacity={0.48}
              />
              <circle
                cx={hoverSvgX}
                cy={hoverSvgY}
                r={7}
                fill={activeSeries === "privado" ? "var(--viz-accent)" : "var(--text-muted)"}
                fillOpacity={0.14}
              />
              <circle
                cx={hoverSvgX}
                cy={hoverSvgY}
                r={2.8}
                fill={activeSeries === "privado" ? "var(--viz-accent)" : "var(--text-muted)"}
              />
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
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--viz-accent)", flexShrink: 0 }} />
              <span style={{ color: "var(--text-muted)", fontSize: 12, flexGrow: 1 }}>Sector privado</span>
              <strong style={{ color: "var(--text)", fontSize: 12, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                {formatOne(activePoint.privado)}
              </strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-muted)", flexShrink: 0 }} />
              <span style={{ color: "var(--text-muted)", fontSize: 12, flexGrow: 1 }}>Sector público</span>
              <strong style={{ color: "var(--text)", fontSize: 12, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                {formatOne(activePoint.publico)}
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
