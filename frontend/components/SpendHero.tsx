'use client';

import React, { useState } from 'react';
import { DailySummary } from '../lib/types';
import { CostTrendChart } from './CostTrendChart';
import { ServiceBarChart } from './ServiceBarChart';

interface SpendHeroProps {
  summary: DailySummary;
  onOpenDigestModal: () => void;
}

export const SpendHero: React.FC<SpendHeroProps> = ({ summary, onOpenDigestModal }) => {
  const [copied, setCopied] = useState(false);
  const { total_spend, total_delta, date, insights = [], breakdowns = [] } = summary.report;

  const isIncrease = total_delta >= 0;
  const previousSpend = total_spend - total_delta;
  const percentChange = previousSpend > 0 ? (total_delta / previousSpend) * 100 : 0;
  const spikedCount = insights.length || breakdowns.filter((b) => b.delta_amount > 1.0).length;
  const totalPotentialSavings = insights.reduce((acc, curr) => acc + (curr.impact_amount || 0), 0);

  const handleCopyText = () => {
    navigator.clipboard.writeText(summary.formatted_summary.formatted_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Card 1: Total Spend Trend (Matching Screenshot Top-Left Line Chart Card) */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-ring transition-all">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Yesterday&apos;s Spend</span>
            <span className="text-[11px] font-mono text-muted-foreground">{date || 'Daily'}</span>
          </div>

          <div className="mt-2.5">
            <h2 className="text-3xl font-extrabold font-mono tracking-tight text-foreground">
              ${total_spend.toFixed(2)}
            </h2>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              <span className={isIncrease ? 'text-destructive font-semibold' : 'text-emerald-600 font-semibold'}>
                {isIncrease ? '+' : ''}{percentChange.toFixed(1)}%
              </span>{' '}
              (${isIncrease ? '+' : ''}{total_delta.toFixed(2)}) from previous day
            </p>
          </div>
        </div>

        {/* Real Cost Trend Line Chart with Data Circles */}
        <div className="mt-4 pt-1">
          <CostTrendChart />
        </div>
      </div>

      {/* Card 2: Service Distribution Bar Chart (Matching Screenshot Top-Right Bar Chart Card) */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-ring transition-all">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Service Breakdown</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-mono text-foreground border border-border">
              {spikedCount} Spikes Flagged
            </span>
          </div>

          <div className="mt-2.5">
            <h2 className="text-3xl font-extrabold font-mono tracking-tight text-foreground">
              ${total_spend.toFixed(2)}
            </h2>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Core AWS services usage distribution (EC2, S3, RDS, NAT)
            </p>
          </div>
        </div>

        {/* Real Service Bar Chart */}
        <div className="mt-3">
          <ServiceBarChart breakdowns={breakdowns} totalSpend={total_spend} />
        </div>
      </div>

      {/* Card 3: Actionable Briefing & Recovery Savings */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-ring transition-all">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Estimated Cost Recovery</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>

          <div className="mt-2.5">
            <h2 className="text-3xl font-extrabold font-mono tracking-tight text-foreground">
              ${totalPotentialSavings.toFixed(2)}
            </h2>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Identified monthly savings from actionable cost spikes
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 space-y-2">
          <button
            onClick={handleCopyText}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 px-3 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition"
          >
            {copied ? '✓ Copied to Clipboard!' : 'Copy Morning Digest'}
          </button>
          <button
            onClick={onOpenDigestModal}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary py-2 px-3 text-xs font-medium text-secondary-foreground hover:bg-accent transition"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Preview Notification Format</span>
          </button>
        </div>
      </div>
    </div>
  );
};
