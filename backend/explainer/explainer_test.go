package explainer

import (
	"strings"
	"testing"

	"peekaboo/models"
)

func TestAnalyzeSpendChanges(t *testing.T) {
	breakdowns := []models.ServiceBreakdown{
		{ServiceName: "EC2", SpendAmount: 22.40, DeltaAmount: 9.80},
		{ServiceName: "S3", SpendAmount: 9.60, DeltaAmount: 4.10},
		{ServiceName: "Lambda", SpendAmount: 0.50, DeltaAmount: 0.10},
	}

	res := AnalyzeSpendChanges(32.50, 14.00, breakdowns)
	if len(res.SpikedServices) != 2 {
		t.Fatalf("expected 2 spiked services (> $1.00 delta), got %d", len(res.SpikedServices))
	}
}

func TestGeneratePlainTextSummary(t *testing.T) {
	report := &models.CostReport{
		TotalSpend: 43.72,
		TotalDelta: 18.40,
		Insights: []models.Insight{
			{
				Reason:         "EC2 instance `i-abc123` ran for 14 extra hours (+$9.80)",
				Recommendation: "Stop the unused EC2 instance.",
			},
			{
				Reason:         "EBS snapshot storage increased by 120 GB (+$4.10)",
				Recommendation: "Delete snapshots older than 90 days.",
			},
		},
	}

	summary := GeneratePlainTextSummary(report)

	if !strings.Contains(summary.Header, "Yesterday's AWS spend: $43.72 (+$18.40)") {
		t.Errorf("unexpected header format: %s", summary.Header)
	}

	if len(summary.WhyBullets) != 2 {
		t.Errorf("expected 2 why bullets, got %d", len(summary.WhyBullets))
	}

	if len(summary.SuggestedActions) != 2 {
		t.Errorf("expected 2 suggested actions, got %d", len(summary.SuggestedActions))
	}
}
