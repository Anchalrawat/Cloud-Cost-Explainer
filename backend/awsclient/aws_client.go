package awsclient

import (
	"context"

	"peekaboo/models"
)

type AWSClient interface {
	FetchDailyCosts(ctx context.Context, account *models.AWSAccount) (totalSpend float64, totalDelta float64, breakdowns []models.ServiceBreakdown, err error)
	InvestigateEC2(ctx context.Context, account *models.AWSAccount) ([]models.Insight, error)
	InvestigateS3(ctx context.Context, account *models.AWSAccount) ([]models.Insight, error)
	InvestigateRDS(ctx context.Context, account *models.AWSAccount) ([]models.Insight, error)
}
