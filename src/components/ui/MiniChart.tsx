import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { useChartTheme } from '../../hooks/useChartTheme';

interface MiniChartProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}

export default function MiniChart({ data, color, height = 40, className = '' }: MiniChartProps) {
  const chartTheme = useChartTheme();
  const strokeColor = color ?? chartTheme.primary;
  const chartData = data.map((v, i) => ({ i, v }));

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div
                  className="text-xs px-2 py-1 rounded-lg shadow-lg"
                  style={{ background: chartTheme.tooltipBg, color: chartTheme.tooltipText }}
                >
                  {payload[0].value?.toLocaleString('fr-FR')}
                </div>
              ) : null
            }
          />
          <Line
            type="monotone"
            dataKey="v"
            stroke={strokeColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: strokeColor }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface GradientMiniChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export function GradientMiniChart({ data, color, height = 48 }: GradientMiniChartProps) {
  const chartTheme = useChartTheme();
  const strokeColor = color ?? chartTheme.primary;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = ((max - v) / range) * (height - 8) + 4;
    return `${x},${y}`;
  });

  const areaPoints = [
    `0,${height}`,
    ...points,
    `100,${height}`,
  ].join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${strokeColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${strokeColor.replace('#', '')})`} />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
