package explainer

import (
	"context"
	"peekaboo/awsclient"
	"peekaboo/models"
)

type Investigator struct {
	awsClient awsclient.AWSClient
}

func NewInvestigator(client awsclient.AWSClient) *Investigator {
	return &Investigator{awsClient: client}
}

func (inv *Investigator) InvestigateSpikes(ctx context.Context, account *models.AWSAccount, spiked []models.ServiceBreakdown) ([]models.Insight, error) {
	var allInsights []models.Insight

	// Trigger specific resource investigation based on spiked services
	for _, s := range spiked {
		switch {
		case s.ServiceName == "Amazon Elastic Compute Cloud (EC2)":
			ec2Insights, err := inv.awsClient.InvestigateEC2(ctx, account)
			if err == nil {
				allInsights = append(allInsights, ec2Insights...)
			}
		case s.ServiceName == "Amazon Simple Storage Service (S3)" || s.ServiceName == "AWS EC2 NAT Gateway":
			s3Insights, err := inv.awsClient.InvestigateS3(ctx, account)
			if err == nil {
				allInsights = append(allInsights, s3Insights...)
			}
		case s.ServiceName == "Amazon Relational Database Service (RDS)":
			rdsInsights, err := inv.awsClient.InvestigateRDS(ctx, account)
			if err == nil {
				allInsights = append(allInsights, rdsInsights...)
			}
		}
	}

	// If no specific insights generated, fallback to default generic service spike insights
	if len(allInsights) == 0 {
		for _, s := range spiked {
			allInsights = append(allInsights, models.Insight{
				ServiceName:    s.ServiceName,
				Reason:         s.ServiceName + " usage increased by $" + formatFloat(s.DeltaAmount),
				Recommendation: "Review resource usage and active tags for " + s.ServiceName,
				ImpactAmount:   s.DeltaAmount,
				Severity:       "MEDIUM",
			})
		}
	}

	return allInsights, nil
}
