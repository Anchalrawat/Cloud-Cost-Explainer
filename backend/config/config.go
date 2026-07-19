package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port          string
	DBPath        string
	AWSMockMode   bool
	DefaultRegion string
}

func LoadConfig() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "peekaboo.db"
	}

	mockMode := true
	if val := os.Getenv("AWS_MOCK_MODE"); val != "" {
		if b, err := strconv.ParseBool(val); err == nil {
			mockMode = b
		}
	}

	region := os.Getenv("AWS_REGION")
	if region == "" {
		region = "us-east-1"
	}

	return &Config{
		Port:          port,
		DBPath:        dbPath,
		AWSMockMode:   mockMode,
		DefaultRegion: region,
	}
}
