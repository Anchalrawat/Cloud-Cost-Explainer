'use client';

import React, { useState } from 'react';
import { Insight } from '../lib/types';

interface PlainEnglishExplainerProps {
  whyBullets: string[];
  suggestedActions: string[];
  insights: Insight[];
}

export const PlainEnglishExplainer: React.FC<PlainEnglishExplainerProps> = ({
  whyBullets = [],
  suggestedActions = [],
  insights = [],
}) => {
  const [completedActions, setCompletedActions] = useState<Record<number, boolean>>({});

  const toggleAction = (idx: number) => {
    setCompletedActions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const totalPotentialSavings = insights.reduce((acc, curr) => acc + (curr.impact_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* 2-Column Main Briefing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Plain-English "Why?" Root Cause Briefing */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between hover:border-ring transition-all">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-destructive" />
                <h2 className="text-sm font-bold text-foreground tracking-tight uppercase">Why spend changed</h2>
              </div>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-mono text-muted-foreground border border-border">
                {whyBullets.length} Anomaly Flags
              </span>
            </div>

            <ul className="mt-4 space-y-3">
              {whyBullets.map((bullet, idx) => {
                const cleanedText = bullet.replace(/^- /, '');
                const insightMatch = insights.find(
                  (ins) => ins.reason && cleanedText.includes(ins.resource_id || '')
                );

                return (
                  <li
                    key={idx}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3.5 text-xs leading-relaxed text-foreground transition hover:border-ring"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 text-destructive font-bold">•</span>
                      <div className="font-medium">{formatBulletWithCode(cleanedText)}</div>
                    </div>
                    {insightMatch && (
                      <span className="shrink-0 rounded bg-secondary px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground border border-border">
                        +${insightMatch.impact_amount.toFixed(2)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-6 pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>AWS Cost Explorer Engine</span>
            <span>Automated Daily Sync</span>
          </div>
        </div>

        {/* Column 2: Suggested Actions & Cost Recovery Checklist */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between hover:border-ring transition-all">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-bold text-foreground tracking-tight uppercase">Suggested Actions</h2>
              </div>
              <span className="text-xs font-mono font-medium text-emerald-600">
                {Object.values(completedActions).filter(Boolean).length} / {suggestedActions.length} Completed
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {suggestedActions.map((action, idx) => {
                const cleanedAction = action.replace(/^- /, '');
                const isDone = !!completedActions[idx];

                return (
                  <div
                    key={idx}
                    onClick={() => toggleAction(idx)}
                    className={`group flex cursor-pointer items-center justify-between rounded-lg border p-3.5 text-xs transition ${
                      isDone
                        ? 'border-border bg-muted/20 text-muted-foreground'
                        : 'border-border bg-muted/40 text-foreground hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                          isDone
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input bg-background'
                        }`}
                      >
                        {isDone && (
                          <svg className="h-3 w-3 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`font-medium ${isDone ? 'line-through' : ''}`}>
                        {cleanedAction}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {isDone ? 'Resolved' : 'Actionable'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>Est. Recovery Potential</span>
            <span className="font-bold text-foreground">${totalPotentialSavings.toFixed(2)} / mo</span>
          </div>
        </div>
      </div>

      {/* Enterprise Resource Telemetry Table */}
      {insights.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground tracking-tight uppercase">Flagged Resource Telemetry</h3>
              <p className="text-xs text-muted-foreground">Detailed telemetry for AWS resources driving cost increases</p>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-mono font-medium text-foreground border border-border">
              {insights.length} Resources Monitored
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-[11px] font-mono uppercase text-muted-foreground bg-muted/30">
                <tr>
                  <th className="px-3 py-2.5">Service</th>
                  <th className="px-3 py-2.5">Resource ID</th>
                  <th className="px-3 py-2.5">Telemetry Reason</th>
                  <th className="px-3 py-2.5">Severity</th>
                  <th className="px-3 py-2.5 text-right">Cost Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {insights.map((ins, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition">
                    <td className="px-3 py-3 font-semibold text-foreground">{ins.service_name}</td>
                    <td className="px-3 py-3 font-mono text-muted-foreground">
                      <code className="rounded bg-secondary px-1.5 py-0.5 text-[11px] text-foreground border border-border">
                        {ins.resource_id || 'N/A'}
                      </code>
                    </td>
                    <td className="px-3 py-3 text-foreground">{ins.reason}</td>
                    <td className="px-3 py-3 font-mono">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          ins.severity === 'HIGH'
                            ? 'bg-destructive/10 text-destructive border border-destructive/20'
                            : 'bg-secondary text-foreground border border-border'
                        }`}
                      >
                        {ins.severity}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-foreground">
                      +${ins.impact_amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

function formatBulletWithCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-foreground border border-border">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
