'use client';

import React, { useState } from 'react';
import { ServiceBreakdown } from '../lib/types';

interface ServiceBreakdownGridProps {
  breakdowns: ServiceBreakdown[];
  totalSpend: number;
}

export const ServiceBreakdownGrid: React.FC<ServiceBreakdownGridProps> = ({
  breakdowns = [],
  totalSpend,
}) => {
  const [sortBy, setSortBy] = useState<'spend' | 'delta'>('spend');

  const sortedBreakdowns = [...breakdowns].sort((a, b) => {
    if (sortBy === 'delta') {
      return b.delta_amount - a.delta_amount;
    }
    return b.spend_amount - a.spend_amount;
  });

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h2 className="text-base font-semibold text-foreground">Service Breakdown</h2>
          <p className="text-xs text-muted-foreground">AWS Spend Distribution per Core Service</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">Sort:</span>
          <button
            onClick={() => setSortBy('spend')}
            className={`rounded px-2 py-1 text-xs font-mono font-medium transition ${
              sortBy === 'spend'
                ? 'bg-secondary text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Spend
          </button>
          <button
            onClick={() => setSortBy('delta')}
            className={`rounded px-2 py-1 text-xs font-mono font-medium transition ${
              sortBy === 'delta'
                ? 'bg-secondary text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Increase
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedBreakdowns.map((b, idx) => {
          const percent = totalSpend > 0 ? (b.spend_amount / totalSpend) * 100 : 0;
          const isSpike = b.delta_amount > 1.0;

          return (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 shadow-2xs hover:border-ring transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground truncate max-w-[130px]" title={b.service_name}>
                    {shortenServiceName(b.service_name)}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11px] font-mono font-medium border ${
                      isSpike
                        ? 'bg-destructive/10 text-destructive border-destructive/20'
                        : 'bg-secondary text-muted-foreground border-border'
                    }`}
                  >
                    {b.delta_amount >= 0 ? '+' : ''}${b.delta_amount.toFixed(2)}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-foreground">
                    ${b.spend_amount.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {percent.toFixed(1)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isSpike ? 'bg-primary' : 'bg-muted-foreground'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(4, percent))}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>{getCategory(b.service_name)}</span>
                <span className={isSpike ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                  {isSpike ? 'Spike' : 'Normal'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function shortenServiceName(name: string): string {
  if (name.includes('EC2')) return 'EC2 Compute';
  if (name.includes('S3')) return 'S3 Storage';
  if (name.includes('RDS')) return 'RDS Database';
  if (name.includes('NAT')) return 'NAT Gateway';
  return name;
}

function getCategory(name: string): string {
  if (name.includes('EC2')) return 'Compute';
  if (name.includes('S3')) return 'Storage';
  if (name.includes('RDS')) return 'Database';
  if (name.includes('NAT')) return 'Networking';
  return 'Cloud';
}
