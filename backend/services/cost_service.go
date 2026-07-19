package services

import (
	"context"
	"fmt"
	"time"

	"peekaboo/awsclient"
	"peekaboo/db"
	"peekaboo/explainer"
	"peekaboo/models"
)

type CostService struct {
	repo      *db.Repository
	awsClient awsclient.AWSClient
}

func NewCostService(repo *db.Repository, client awsclient.AWSClient) *CostService {
	return &CostService{
		repo:      repo,
		awsClient: client,
	}
}

func (s *CostService) RunDailyCostExplainer(ctx context.Context, userID string) (*models.DailySummary, error) {
	// 1. Get AWS Account for user
	acc, err := s.repo.GetAWSAccountByUserID(userID)
	if err != nil {
		// Default fallback account for demo / initial runs
		acc = &models.AWSAccount{
			ID:         fmt.Sprintf("acc-%d", time.Now().Unix()),
			UserID:     userID,
			AccountID:  "123456789012",
			RoleArn:    "arn:aws:iam::123456789012:role/PeekabooReadOnlyRole",
			ExternalID: "ext-peekaboo-demo",
			Status:     "CONNECTED",
		}
		_ = s.repo.SaveAWSAccount(acc)
	}

	// 2. Fetch costs
	totalSpend, totalDelta, breakdowns, err := s.awsClient.FetchDailyCosts(ctx, acc)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch daily costs: %w", err)
	}

	// 3. Analyze spend changes
	analysis := explainer.AnalyzeSpendChanges(totalSpend, totalDelta, breakdowns)

	// 4. Investigate spikes
	investigator := explainer.NewInvestigator(s.awsClient)
	insights, err := investigator.InvestigateSpikes(ctx, acc, analysis.SpikedServices)
	if err != nil {
		return nil, fmt.Errorf("investigation failed: %w", err)
	}

	// 5. Create CostReport with dynamic current timestamp & yesterday's date
	reportID := fmt.Sprintf("rep-%d", time.Now().UnixNano())
	report := &models.CostReport{
		ID:         reportID,
		AccountID:  acc.ID,
		Date:       yesterdayDateString(),
		TotalSpend: totalSpend,
		TotalDelta: totalDelta,
		Currency:   "USD",
		Breakdowns: breakdowns,
		Insights:   insights,
	}

	// 6. Save report to DB
	if err := s.repo.SaveCostReport(report); err != nil {
		return nil, fmt.Errorf("failed to save report to db: %w", err)
	}

	// 7. Format summary
	summaryText := explainer.GeneratePlainTextSummary(report)

	return &models.DailySummary{
		Report:           *report,
		FormattedSummary: summaryText,
	}, nil
}

func (s *CostService) GetLatestSummary(ctx context.Context, userID string) (*models.DailySummary, error) {
	acc, err := s.repo.GetAWSAccountByUserID(userID)
	if err != nil {
		// Run first explainer run automatically if not found
		return s.RunDailyCostExplainer(ctx, userID)
	}

	report, err := s.repo.GetLatestReport(acc.ID)
	if err != nil || report == nil {
		return s.RunDailyCostExplainer(ctx, userID)
	}

	summaryText := explainer.GeneratePlainTextSummary(report)
	return &models.DailySummary{
		Report:           *report,
		FormattedSummary: summaryText,
	}, nil
}

func (s *CostService) ConnectAWSAccount(userID, accountID, roleArn, externalID string) (*models.AWSAccount, error) {
	acc := &models.AWSAccount{
		ID:         fmt.Sprintf("acc-%d", time.Now().UnixNano()),
		UserID:     userID,
		AccountID:  accountID,
		RoleArn:    roleArn,
		ExternalID: externalID,
		Status:     "CONNECTED",
	}

	if err := s.repo.SaveAWSAccount(acc); err != nil {
		return nil, err
	}
	return acc, nil
}

func yesterdayDateString() string {
	return time.Now().AddDate(0, 0, -1).Format("2006-01-02")
}
