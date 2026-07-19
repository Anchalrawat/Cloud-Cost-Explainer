export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface AWSAccount {
  id: string;
  user_id: string;
  account_id: string;
  role_arn: string;
  external_id: string;
  status: string;
  created_at: string;
}

export interface ServiceBreakdown {
  id?: string;
  report_id?: string;
  service_name: string;
  spend_amount: number;
  delta_amount: number;
}

export interface Insight {
  id?: string;
  report_id?: string;
  service_name: string;
  resource_id?: string;
  reason: string;
  recommendation: string;
  impact_amount: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface CostReport {
  id: string;
  account_id: string;
  date: string;
  total_spend: number;
  total_delta: number;
  currency: string;
  created_at: string;
  breakdowns: ServiceBreakdown[];
  insights: Insight[];
}

export interface PlainTextSummary {
  header: string;
  why_bullets: string[];
  suggested_actions: string[];
  formatted_text: string;
}

export interface DailySummary {
  report: CostReport;
  formatted_summary: PlainTextSummary;
}

export interface ConnectAWSPayload {
  user_id?: string;
  account_id: string;
  role_arn: string;
  external_id?: string;
}
