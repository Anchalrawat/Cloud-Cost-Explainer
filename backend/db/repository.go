package db

import (
	"fmt"
	"sort"
	"time"

	"peekaboo/models"
)

type Repository struct {
	db *DB
}

func NewRepository(database *DB) *Repository {
	return &Repository{db: database}
}

func (r *Repository) CreateOrGetUser(id, email, name string) (*models.User, error) {
	r.db.mu.Lock()
	defer r.db.mu.Unlock()

	for _, u := range r.db.Users {
		if u.Email == email {
			return u, nil
		}
	}

	user := &models.User{
		ID:        id,
		Email:     email,
		Name:      name,
		CreatedAt: time.Now(),
	}
	r.db.Users[id] = user
	_ = r.db.save()
	return user, nil
}

func (r *Repository) SaveAWSAccount(acc *models.AWSAccount) error {
	r.db.mu.Lock()
	defer r.db.mu.Unlock()

	acc.CreatedAt = time.Now()
	r.db.AWSAccounts[acc.ID] = acc
	return r.db.save()
}

func (r *Repository) GetAWSAccountByUserID(userID string) (*models.AWSAccount, error) {
	r.db.mu.RLock()
	defer r.db.mu.RUnlock()

	for _, acc := range r.db.AWSAccounts {
		if acc.UserID == userID {
			return acc, nil
		}
	}
	return nil, fmt.Errorf("aws account not found for user: %s", userID)
}

func (r *Repository) SaveCostReport(report *models.CostReport) error {
	r.db.mu.Lock()
	defer r.db.mu.Unlock()

	report.CreatedAt = time.Now()
	r.db.CostReports[report.ID] = report

	for _, b := range report.Breakdowns {
		if b.ID == "" {
			b.ID = fmt.Sprintf("sb-%s-%s", report.ID, b.ServiceName)
		}
		b.ReportID = report.ID
		r.db.CostBreakdown[b.ID] = &b
	}

	for _, ins := range report.Insights {
		if ins.ID == "" {
			ins.ID = fmt.Sprintf("ins-%s-%s", report.ID, ins.ServiceName)
		}
		ins.ReportID = report.ID
		r.db.Insights[ins.ID] = &ins
	}

	return r.db.save()
}

func (r *Repository) GetLatestReport(accountID string) (*models.CostReport, error) {
	r.db.mu.RLock()
	defer r.db.mu.RUnlock()

	var matched []*models.CostReport
	for _, rep := range r.db.CostReports {
		if rep.AccountID == accountID {
			matched = append(matched, rep)
		}
	}

	if len(matched) == 0 {
		return nil, fmt.Errorf("no cost report found for account: %s", accountID)
	}

	sort.Slice(matched, func(i, j int) bool {
		return matched[i].CreatedAt.After(matched[j].CreatedAt)
	})

	return matched[0], nil
}

func (r *Repository) GetReportHistory(accountID string, limit int) ([]models.CostReport, error) {
	r.db.mu.RLock()
	defer r.db.mu.RUnlock()

	if limit <= 0 {
		limit = 14
	}

	var matched []models.CostReport
	for _, rep := range r.db.CostReports {
		if rep.AccountID == accountID {
			matched = append(matched, *rep)
		}
	}

	sort.Slice(matched, func(i, j int) bool {
		return matched[i].CreatedAt.After(matched[j].CreatedAt)
	})

	if len(matched) > limit {
		matched = matched[:limit]
	}

	return matched, nil
}
