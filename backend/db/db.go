package db

import (
	"encoding/json"
	"fmt"
	"os"
	"sync"

	"peekaboo/models"
)

type DB struct {
	mu            sync.RWMutex
	filePath      string
	Users         map[string]*models.User          `json:"users"`
	AWSAccounts   map[string]*models.AWSAccount    `json:"aws_accounts"`
	CostReports   map[string]*models.CostReport    `json:"cost_reports"`
	CostBreakdown map[string]*models.ServiceBreakdown `json:"cost_breakdowns"`
	Insights      map[string]*models.Insight       `json:"insights"`
}

func InitDB(dbPath string) (*DB, error) {
	database := &DB{
		filePath:      dbPath,
		Users:         make(map[string]*models.User),
		AWSAccounts:   make(map[string]*models.AWSAccount),
		CostReports:   make(map[string]*models.CostReport),
		CostBreakdown: make(map[string]*models.ServiceBreakdown),
		Insights:      make(map[string]*models.Insight),
	}

	if err := database.load(); err != nil {
		// If file doesn't exist yet, save empty database schema
		if err := database.save(); err != nil {
			return nil, fmt.Errorf("failed to initialize sqlite db file: %w", err)
		}
	}

	return database, nil
}

func (d *DB) load() error {
	d.mu.Lock()
	defer d.mu.Unlock()

	data, err := os.ReadFile(d.filePath)
	if err != nil {
		return err
	}

	return json.Unmarshal(data, d)
}

func (d *DB) save() error {
	data, err := json.MarshalIndent(d, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(d.filePath, data, 0644)
}
