package models

import (
	"time"
)

type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

type AWSAccount struct {
	ID         string    `json:"id"`
	UserID     string    `json:"user_id"`
	AccountID  string    `json:"account_id"`
	RoleArn    string    `json:"role_arn"`
	ExternalID string    `json:"external_id"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
}

type CostReport struct {
	ID         string             `json:"id"`
	AccountID  string             `json:"account_id"`
	Date       string             `json:"date"` // e.g. "2026-07-18"
	TotalSpend float64            `json:"total_spend"`
	TotalDelta float64            `json:"total_delta"`
	Currency   string             `json:"currency"`
	CreatedAt  time.Time          `json:"created_at"`
	Breakdowns []ServiceBreakdown `json:"breakdowns,omitempty"`
	Insights   []Insight          `json:"insights,omitempty"`
}

type ServiceBreakdown struct {
	ID          string  `json:"id,omitempty"`
	ReportID    string  `json:"report_id,omitempty"`
	ServiceName string  `json:"service_name"`
	SpendAmount float64 `json:"spend_amount"`
	DeltaAmount float64 `json:"delta_amount"`
}

type Insight struct {
	ID             string  `json:"id,omitempty"`
	ReportID       string  `json:"report_id,omitempty"`
	ServiceName    string  `json:"service_name"`
	ResourceID     string  `json:"resource_id,omitempty"`
	Reason         string  `json:"reason"`
	Recommendation string  `json:"recommendation"`
	ImpactAmount   float64 `json:"impact_amount"`
	Severity       string  `json:"severity"` // e.g. "HIGH", "MEDIUM", "LOW"
}

type PlainTextSummary struct {
	Header         string   `json:"header"`
	WhyBullets     []string `json:"why_bullets"`
	SuggestedActions []string `json:"suggested_actions"`
	FormattedText  string   `json:"formatted_text"`
}

type DailySummary struct {
	Report           CostReport       `json:"report"`
	FormattedSummary PlainTextSummary `json:"formatted_summary"`
}
