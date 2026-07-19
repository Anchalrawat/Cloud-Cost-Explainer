'use client';

import React, { useEffect, useState } from 'react';
import { DailySummary, ConnectAWSPayload } from '../lib/types';
import { fetchLatestReport, triggerReportRun, connectAWSAccount } from '../lib/api';
import { Header } from '../components/Header';
import { SpendHero } from '../components/SpendHero';
import { PlainEnglishExplainer } from '../components/PlainEnglishExplainer';
import { ServiceBreakdownGrid } from '../components/ServiceBreakdownGrid';
import { ConnectAWSModal } from '../components/ConnectAWSModal';
import { DigestPreviewModal } from '../components/DigestPreviewModal';

export default function Home() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isDigestModalOpen, setIsDigestModalOpen] = useState(false);
  const [activeAccountId, setActiveAccountId] = useState('');

  const loadData = async () => {
    try {
      const data = await fetchLatestReport();
      setSummary(data);
      if (data.report?.account_id) {
        setActiveAccountId(data.report.account_id);
      }
    } catch (err) {
      console.error('Failed to load initial report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const updated = await triggerReportRun();
      setSummary(updated);
      if (updated.report?.account_id) {
        setActiveAccountId(updated.report.account_id);
      }
    } catch (err) {
      console.error('Failed to run explainer:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConnectAWS = async (payload: ConnectAWSPayload) => {
    const acc = await connectAWSAccount(payload);
    if (acc?.account_id) {
      setActiveAccountId(acc.account_id);
    }
    await handleRefresh();
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background font-mono text-xs text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p>Analyzing AWS Cost Explorer data...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
        <h2 className="text-sm font-semibold text-foreground">Failed to connect to Cost Explainer backend</h2>
        <button
          onClick={loadData}
          className="mt-3 rounded-md bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header */}
      <Header
        accountId={activeAccountId || summary.report?.account_id || '123456789012'}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onOpenDigestModal={() => setIsDigestModalOpen(true)}
      />

      {/* Main Content Dashboard Layout */}
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {/* Spend Hero Metrics & Charts */}
        <SpendHero
          summary={summary}
          onOpenDigestModal={() => setIsDigestModalOpen(true)}
        />

        {/* Plain-English Explainer Bento Cards */}
        <PlainEnglishExplainer
          whyBullets={summary.formatted_summary?.why_bullets || []}
          suggestedActions={summary.formatted_summary?.suggested_actions || []}
          insights={summary.report?.insights || []}
        />

        {/* Service Breakdown Cards */}
        <ServiceBreakdownGrid
          breakdowns={summary.report?.breakdowns || []}
          totalSpend={summary.report?.total_spend || 0}
        />
      </main>

      {/* Connect AWS IAM Role Modal */}
      <ConnectAWSModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleConnectAWS}
      />

      {/* Daily Email/Slack Digest Preview Modal */}
      <DigestPreviewModal
        isOpen={isDigestModalOpen}
        onClose={() => setIsDigestModalOpen(false)}
        formattedText={summary.formatted_summary?.formatted_text || ''}
      />
    </div>
  );
}
