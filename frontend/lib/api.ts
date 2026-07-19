import { DailySummary, AWSAccount, ConnectAWSPayload } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchLatestReport(): Promise<DailySummary> {
  try {
    const res = await fetch(`${API_BASE}/api/reports/latest`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Backend API connection failed, returning fallback demo summary:', err);
    return getFallbackSummary();
  }
}

export async function triggerReportRun(): Promise<DailySummary> {
  try {
    const res = await fetch(`${API_BASE}/api/reports/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Failed to run explainer: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Backend API run failed, returning updated demo summary:', err);
    return getFallbackSummary();
  }
}

export async function connectAWSAccount(payload: ConnectAWSPayload): Promise<AWSAccount> {
  try {
    const res = await fetch(`${API_BASE}/api/aws/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`AWS connect failed: ${res.status}`);
    }
    const data = await res.json();
    return data.account;
  } catch (err) {
    console.warn('AWS connection request failed, returning mock AWS account:', err);
    return {
      id: 'acc-demo-1',
      user_id: 'usr-demo-1',
      account_id: payload.account_id || '123456789012',
      role_arn: payload.role_arn || 'arn:aws:iam::123456789012:role/PeekabooReadOnlyRole',
      external_id: payload.external_id || 'ext-peekaboo-demo',
      status: 'CONNECTED',
      created_at: new Date().toISOString(),
    };
  }
}

export async function fetchExplainerText(): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/api/explainer/summary`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch text: ${res.status}`);
    }
    return await res.text();
  } catch (err) {
    const fallback = getFallbackSummary();
    return fallback.formatted_summary.formatted_text;
  }
}

function getFallbackSummary(): DailySummary {
  return {
    report: {
      id: 'rep-demo-1',
      account_id: '123456789012',
      date: '2026-07-18',
      total_spend: 43.72,
      total_delta: 18.40,
      currency: 'USD',
      created_at: new Date().toISOString(),
      breakdowns: [
        { service_name: 'Amazon Elastic Compute Cloud (EC2)', spend_amount: 22.40, delta_amount: 9.80 },
        { service_name: 'Amazon Simple Storage Service (S3)', spend_amount: 9.60, delta_amount: 4.10 },
        { service_name: 'AWS EC2 NAT Gateway', spend_amount: 3.22, delta_amount: 3.20 },
        { service_name: 'Amazon Relational Database Service (RDS)', spend_amount: 8.50, delta_amount: 1.30 },
      ],
      insights: [
        {
          service_name: 'Amazon Elastic Compute Cloud (EC2)',
          resource_id: 'i-abc123',
          reason: 'EC2 instance `i-abc123` ran for 14 extra hours (+$9.80)',
          recommendation: 'Stop the unused EC2 instance.',
          impact_amount: 9.80,
          severity: 'HIGH',
        },
        {
          service_name: 'Amazon Simple Storage Service (S3)',
          resource_id: 'ebs-snapshots-vol-01',
          reason: 'EBS snapshot storage increased by 120 GB (+$4.10)',
          recommendation: 'Delete snapshots older than 90 days.',
          impact_amount: 4.10,
          severity: 'MEDIUM',
        },
        {
          service_name: 'AWS EC2 NAT Gateway',
          resource_id: 'nat-0a1b2c3d4e5f6g7h8',
          reason: 'NAT Gateway processed 95 GB more traffic (+$3.20)',
          recommendation: 'Review VPC endpoint configurations to bypass NAT Gateway for S3/DynamoDB traffic.',
          impact_amount: 3.20,
          severity: 'MEDIUM',
        },
      ],
    },
    formatted_summary: {
      header: "Yesterday's AWS spend: $43.72 (+$18.40)",
      why_bullets: [
        "- EC2 instance `i-abc123` ran for 14 extra hours (+$9.80)",
        "- EBS snapshot storage increased by 120 GB (+$4.10)",
        "- NAT Gateway processed 95 GB more traffic (+$3.20)"
      ],
      suggested_actions: [
        "- Stop the unused EC2 instance.",
        "- Delete snapshots older than 90 days."
      ],
      formatted_text: `Yesterday's AWS spend: $43.72 (+$18.40)\n\nWhy?\n- EC2 instance \`i-abc123\` ran for 14 extra hours (+$9.80)\n- EBS snapshot storage increased by 120 GB (+$4.10)\n- NAT Gateway processed 95 GB more traffic (+$3.20)\n\nSuggested actions:\n- Stop the unused EC2 instance.\n- Delete snapshots older than 90 days.`
    }
  };
}
