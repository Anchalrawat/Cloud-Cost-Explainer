package explainer

import (
	"fmt"
	"strings"

	"peekaboo/models"
)

func GeneratePlainTextSummary(report *models.CostReport) models.PlainTextSummary {
	sign := "+"
	if report.TotalDelta < 0 {
		sign = "-"
	}

	header := fmt.Sprintf("Yesterday's AWS spend: $%.2f (%s$%.2f)", report.TotalSpend, sign, absFloat(report.TotalDelta))

	var whyBullets []string
	var suggestedActions []string

	actionSeen := make(map[string]bool)

	for _, ins := range report.Insights {
		whyBullets = append(whyBullets, "- "+ins.Reason)
		if !actionSeen[ins.Recommendation] {
			suggestedActions = append(suggestedActions, "- "+ins.Recommendation)
			actionSeen[ins.Recommendation] = true
		}
	}

	if len(whyBullets) == 0 {
		whyBullets = append(whyBullets, "- No significant spend spikes detected yesterday.")
	}
	if len(suggestedActions) == 0 {
		suggestedActions = append(suggestedActions, "- Maintain existing cloud infrastructure state.")
	}

	var sb strings.Builder
	sb.WriteString(header + "\n\n")
	sb.WriteString("Why?\n\n")
	for _, b := range whyBullets {
		sb.WriteString(b + "\n")
	}
	sb.WriteString("\nSuggested actions:\n\n")
	for _, a := range suggestedActions {
		sb.WriteString(a + "\n")
	}

	return models.PlainTextSummary{
		Header:           header,
		WhyBullets:       whyBullets,
		SuggestedActions: suggestedActions,
		FormattedText:    strings.TrimSpace(sb.String()),
	}
}

func absFloat(v float64) float64 {
	if v < 0 {
		return -v
	}
	return v
}

func formatFloat(v float64) string {
	return fmt.Sprintf("%.2f", v)
}
