package explainer

import (
	"peekaboo/models"
)

type SpendDeltaSummary struct {
	TotalSpend   float64
	TotalDelta   float64
	SpikedServices []models.ServiceBreakdown
}

func AnalyzeSpendChanges(totalSpend, totalDelta float64, breakdowns []models.ServiceBreakdown) SpendDeltaSummary {
	var spiked []models.ServiceBreakdown
	for _, b := range breakdowns {
		// Flag services where spend increased by more than $1.00
		if b.DeltaAmount > 1.00 {
			spiked = append(spiked, b)
		}
	}

	return SpendDeltaSummary{
		TotalSpend:     totalSpend,
		TotalDelta:     totalDelta,
		SpikedServices: spiked,
	}
}
