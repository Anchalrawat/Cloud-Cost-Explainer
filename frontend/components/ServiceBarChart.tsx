'use client';

import React, { useState } from 'react';
import { ServiceBreakdown } from '../lib/types';

interface ServiceBarChartProps {
  breakdowns: ServiceBreakdown[];
  totalSpend: number;
}

const CHART_COLORS = [
  'var(--color-chart-1, var(--primary))',
  'var(--color-chart-2, var(--primary))',
  'var(--color-chart-3, var(--primary))',
  'var(--color-chart-4, var(--primary))',
  'var(--color-chart-5, var(--primary))',
];

export const ServiceBarChart: React.FC<ServiceBarChartProps> = ({
  breakdowns = [],
  totalSpend,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxSpend = Math.max(...breakdowns.map((b) => b.spend_amount), 1);

  return (
    <div className="w-full space-y-3">
      {/* Bars Container matching the screenshot bar chart */}
      <div className="flex items-end justify-between gap-3 h-24 px-1 pt-4">
        {breakdowns.map((b, idx) => {
          const heightPercent = (b.spend_amount / maxSpend) * 100;
          const isHovered = hoveredIdx === idx;
          const barColor = CHART_COLORS[idx % CHART_COLORS.length];

          return (
            <div
              key={idx}
              className="group relative flex flex-1 flex-col items-center h-full justify-end cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-7 z-20 rounded-md bg-foreground px-2 py-0.5 text-[10px] font-mono font-medium text-background shadow-xs whitespace-nowrap">
                  ${b.spend_amount.toFixed(2)} (+${b.delta_amount.toFixed(2)})
                </div>
              )}

              {/* Bar with theme chart accent color */}
              <div
                className="w-full rounded-t-md transition-all duration-200 group-hover:opacity-100"
                style={{
                  height: `${Math.max(12, heightPercent)}%`,
                  backgroundColor: barColor,
                  opacity: isHovered ? 1 : 0.85,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Labels below bars */}
      <div className="flex justify-between border-t border-border pt-2 text-[11px] font-mono text-muted-foreground">
        {breakdowns.map((b, idx) => (
          <span key={idx} className="flex-1 text-center truncate px-0.5">
            {shortenLabel(b.service_name)}
          </span>
        ))}
      </div>
    </div>
  );
};

function shortenLabel(name: string): string {
  if (name.includes('EC2')) return 'EC2';
  if (name.includes('S3')) return 'S3';
  if (name.includes('RDS')) return 'RDS';
  if (name.includes('NAT')) return 'NAT';
  return name.slice(0, 4);
}
