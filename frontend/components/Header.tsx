'use client';

import React from 'react';

interface HeaderProps {
  accountId: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenConnectModal: () => void;
  onOpenDigestModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  accountId,
  isRefreshing,
  onRefresh,
  onOpenConnectModal,
  onOpenDigestModal,
}) => {
  return (
    <header className="w-full border-b border-border bg-card shadow-xs">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6">
        {/* Top Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold shadow-xs">
              ▲
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">Peekaboo</h1>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground border border-border">
                minimal
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenConnectModal}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition shadow-2xs"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AWS: <code className="font-mono">{accountId}</code></span>
            </button>

            <button
              onClick={onOpenDigestModal}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition shadow-2xs"
            >
              <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Digest</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition disabled:opacity-50"
            >
              <svg
                className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{isRefreshing ? 'Analyzing...' : 'Run Analysis'}</span>
            </button>
          </div>
        </div>

        {/* Dashboard Title Header (Not a tab switcher) */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-base font-bold tracking-tight text-foreground">Dashboard</h2>

          <span className="hidden sm:inline-block text-[11px] font-mono text-muted-foreground">
            AWS Cost & Usage API Connected
          </span>
        </div>
      </div>
    </header>
  );
};
