package awsclient

import (
	"context"

	"peekaboo/models"
)

type MockAWSClient struct{}

func NewMockAWSClient() *MockAWSClient {
	return &MockAWSClient{}
}

func (m *MockAWSClient) FetchDailyCosts(ctx context.Context, account *models.AWSAccount) (float64, float64, []models.ServiceBreakdown, error) {
	totalSpend := 43.72
	totalDelta := 18.40

	breakdowns := []models.ServiceBreakdown{
		{
			ID:          "sb-ec2",
			ServiceName: "Amazon Elastic Compute Cloud (EC2)",
			SpendAmount: 22.40,
			DeltaAmount: 9.80,
		},
		{
			ID:          "sb-s3",
			ServiceName: "Amazon Simple Storage Service (S3)",
			SpendAmount: 9.60,
			DeltaAmount: 4.10,
		},
		{
			ID:          "sb-nat",
			ServiceName: "AWS EC2 NAT Gateway",
			SpendAmount: 3.22,
			DeltaAmount: 3.20,
		},
		{
			ID:          "sb-rds",
			ServiceName: "Amazon Relational Database Service (RDS)",
			SpendAmount: 8.50,
			DeltaAmount: 1.30,
		},
	}

	return totalSpend, totalDelta, breakdowns, nil
}

func (m *MockAWSClient) InvestigateEC2(ctx context.Context, account *models.AWSAccount) ([]models.Insight, error) {
	return []models.Insight{
		{
			ID:             "ins-ec2-1",
			ServiceName:    "Amazon Elastic Compute Cloud (EC2)",
			ResourceID:     "i-abc123",
			Reason:         "EC2 instance `i-abc123` ran for 14 extra hours (+$9.80)",
			Recommendation: "Stop the unused EC2 instance.",
			ImpactAmount:   9.80,
			Severity:       "HIGH",
		},
	}, nil
}

func (m *MockAWSClient) InvestigateS3(ctx context.Context, account *models.AWSAccount) ([]models.Insight, error) {
	return []models.Insight{
		{
			ID:             "ins-s3-1",
			ServiceName:    "Amazon Simple Storage Service (S3)",
			ResourceID:     "ebs-snapshots-vol-01",
			Reason:         "EBS snapshot storage increased by 120 GB (+$4.10)",
			Recommendation: "Delete snapshots older than 90 days.",
			ImpactAmount:   4.10,
			Severity:       "MEDIUM",
		},
		{
			ID:             "ins-nat-1",
			ServiceName:    "AWS EC2 NAT Gateway",
			ResourceID:     "nat-0a1b2c3d4e5f6g7h8",
			Reason:         "NAT Gateway processed 95 GB more traffic (+$3.20)",
			Recommendation: "Review VPC endpoint configurations to bypass NAT Gateway for S3/DynamoDB traffic.",
			ImpactAmount:   3.20,
			Severity:       "MEDIUM",
		},
	}, nil
}

func (m *MockAWSClient) InvestigateRDS(ctx context.Context, account *models.AWSAccount) ([]models.Insight, error) {
	return []models.Insight{
		{
			ID:             "ins-rds-1",
			ServiceName:    "Amazon Relational Database Service (RDS)",
			ResourceID:     "db-production-replica",
			Reason:         "RDS instance `db-production-replica` auto-scaled storage by 50 GB (+$1.30)",
			Recommendation: "Check DB retention policies and index usage to optimize storage expansion.",
			ImpactAmount:   1.30,
			Severity:       "LOW",
		},
	}, nil
}
