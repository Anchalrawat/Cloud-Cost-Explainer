'use client';

import React, { useState } from 'react';

interface DataPoint {
  date: string;
  amount: number;
}

interface CostTrendChartProps {
  data?: DataPoint[];
  height?: number;
  showPoints?: boolean;
  color?: string;
}

export const CostTrendChart: React.FC<CostTrendChartProps> = ({
  data,
  height = 80,
  showPoints = true,
  color = 'var(--color-chart-1, var(--foreground))',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Default 7-day spend trend ending with yesterday's spike
  const trendData: DataPoint[] = data && data.length > 0 ? data : [
    { date: 'Jul 12', amount: 23.50 },
    { date: 'Jul 13', amount: 24.10 },
    { date: 'Jul 14', amount: 22.80 },
    { date: 'Jul 15', amount: 25.30 },
    { date: 'Jul 16', amount: 24.90 },
    { date: 'Jul 17', amount: 25.32 },
    { date: 'Jul 18', amount: 43.72 },
  ];

  const paddingX = 10;
  const paddingY = 12;
  const width = 340;
  const chartHeight = height;

  const amounts = trendData.map((d) => d.amount);
  const minAmount = Math.min(...amounts) * 0.9;
  const maxAmount = Math.max(...amounts) * 1.05;

  const points = trendData.map((d, idx) => {
    const x = paddingX + (idx / (trendData.length - 1)) * (width - 2 * paddingX);
    const y = chartHeight - paddingY - ((d.amount - minAmount) / (maxAmount - minAmount || 1)) * (chartHeight - 2 * paddingY);
    return { x, y, date: d.date, amount: d.amount };
  });

  // Generate smooth cubic bezier curve string
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cpX1 = curr.x + (next.x - curr.x) / 2;
    const cpY1 = curr.y;
    const cpX2 = curr.x + (next.x - curr.x) / 2;
    const cpY2 = next.y;
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
  }

  // Area fill path below line
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  return (
    <div className="relative w-full">
      {/* Tooltip Popup on Hover */}
      {hoveredIdx !== null && (
        <div
          className="absolute -top-7 z-20 -translate-x-1/2 rounded-md bg-foreground px-2 py-0.5 text-[11px] font-mono font-medium text-background shadow-xs pointer-events-none"
          style={{ left: `${(points[hoveredIdx].x / width) * 100}%` }}
        >
          {points[hoveredIdx].date}: ${points[hoveredIdx].amount.toFixed(2)}
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${chartHeight}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient Fill under curve */}
        <path d={areaD} fill="url(#costGradient)" />

        {/* Smooth Trend Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data Circles (Matching reference screenshot line chart circles) */}
        {showPoints &&
          points.map((pt, idx) => (
            <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIdx === idx ? '5' : '3.5'}
                fill="var(--card)"
                stroke={color}
                strokeWidth="2.2"
                className="transition-all duration-150"
              />
            </g>
          ))}
      </svg>
    </div>
  );
};
