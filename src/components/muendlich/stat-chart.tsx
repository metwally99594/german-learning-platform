import { ChartData } from "@/types";

const WIDTH = 480;
const HEIGHT = 220;
const PADDING = { top: 16, right: 16, bottom: 32, left: 40 };

export type StatChartProps = {
  chart: ChartData;
};

export function StatChart({ chart }: StatChartProps) {
  const { points, type, unit } = chart;
  if (points.length === 0) return null;

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const maxValue = Math.max(...points.map((p) => p.value), 1);

  const xFor = (index: number) =>
    points.length > 1 ? (index / (points.length - 1)) * plotWidth : plotWidth / 2;
  const yFor = (value: number) => plotHeight - (value / maxValue) * plotHeight;

  return (
    <figure className="rounded-lg border p-4">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Chart: ${points.map((p) => `${p.label} ${p.value}${unit ?? ""}`).join(", ")}`}
        className="w-full text-foreground"
      >
        <g transform={`translate(${PADDING.left},${PADDING.top})`}>
          {[0, 0.5, 1].map((fraction) => (
            <line
              key={fraction}
              x1={0}
              x2={plotWidth}
              y1={plotHeight * (1 - fraction)}
              y2={plotHeight * (1 - fraction)}
              className="stroke-border"
              strokeWidth={1}
            />
          ))}

          {type === "bar" &&
            points.map((point, i) => {
              const barWidth = plotWidth / points.length - 12;
              const x = (plotWidth / points.length) * i + 6;
              const y = yFor(point.value);
              return (
                <g key={point.label}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={plotHeight - y}
                    className="fill-primary"
                    rx={3}
                  />
                  <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="fill-current text-[10px]">
                    {point.value}
                    {unit}
                  </text>
                </g>
              );
            })}

          {type === "line" && (
            <>
              <polyline
                points={points.map((p, i) => `${xFor(i)},${yFor(p.value)}`).join(" ")}
                fill="none"
                className="stroke-primary"
                strokeWidth={2}
              />
              {points.map((point, i) => (
                <g key={point.label}>
                  <circle cx={xFor(i)} cy={yFor(point.value)} r={3} className="fill-primary" />
                  <text x={xFor(i)} y={yFor(point.value) - 8} textAnchor="middle" className="fill-current text-[10px]">
                    {point.value}
                    {unit}
                  </text>
                </g>
              ))}
            </>
          )}

          {points.map((point, i) => (
            <text
              key={point.label}
              x={type === "bar" ? (plotWidth / points.length) * i + plotWidth / points.length / 2 : xFor(i)}
              y={plotHeight + 16}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {point.label}
            </text>
          ))}
        </g>
      </svg>
    </figure>
  );
}
