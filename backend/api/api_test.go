package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"peekaboo/awsclient"
	"peekaboo/db"
	"peekaboo/services"
)

func setupTestServer(t *testing.T) http.Handler {
	tmpDB := t.TempDir() + "/test_peekaboo.db"
	database, err := db.InitDB(tmpDB)
	if err != nil {
		t.Fatalf("failed to init test db: %v", err)
	}

	repo := db.NewRepository(database)
	mockAWS := awsclient.NewMockAWSClient()
	costService := services.NewCostService(repo, mockAWS)
	handler := NewAPIHandler(repo, costService)

	return SetupRouter(handler)
}

func TestHealthCheckEndpoint(t *testing.T) {
	router := setupTestServer(t)

	req := httptest.NewRequest("GET", "/health", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200 status, got %d", rec.Code)
	}

	if !strings.Contains(rec.Body.String(), "Cloud Cost Explainer MVP Backend") {
		t.Errorf("unexpected health body: %s", rec.Body.String())
	}
}

func TestConnectAWSEndpoint(t *testing.T) {
	router := setupTestServer(t)

	body := map[string]string{
		"user_id":    "usr-demo-1",
		"account_id": "999888777666",
		"role_arn":   "arn:aws:iam::999888777666:role/MyReadOnlyRole",
	}
	jsonBytes, _ := json.Marshal(body)

	req := httptest.NewRequest("POST", "/api/aws/connect", bytes.NewBuffer(jsonBytes))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200 status, got %d", rec.Code)
	}

	if !strings.Contains(rec.Body.String(), "CONNECTED") {
		t.Errorf("expected CONNECTED status in response: %s", rec.Body.String())
	}
}

func TestGetExplainerSummaryEndpoint(t *testing.T) {
	router := setupTestServer(t)

	// Trigger report run
	reqRun := httptest.NewRequest("POST", "/api/reports/run", nil)
	recRun := httptest.NewRecorder()
	router.ServeHTTP(recRun, reqRun)

	if recRun.Code != http.StatusOK {
		t.Fatalf("expected 200 on report run, got %d", recRun.Code)
	}

	// Fetch plain-text explainer summary
	reqSummary := httptest.NewRequest("GET", "/api/explainer/summary", nil)
	recSummary := httptest.NewRecorder()
	router.ServeHTTP(recSummary, reqSummary)

	if recSummary.Code != http.StatusOK {
		t.Fatalf("expected 200 on summary, got %d", recSummary.Code)
	}

	output := recSummary.Body.String()

	expectedPhrases := []string{
		"Yesterday's AWS spend: $43.72 (+$18.40)",
		"Why?",
		"EC2 instance `i-abc123` ran for 14 extra hours (+$9.80)",
		"EBS snapshot storage increased by 120 GB (+$4.10)",
		"Suggested actions:",
		"Stop the unused EC2 instance.",
		"Delete snapshots older than 90 days.",
	}

	for _, phrase := range expectedPhrases {
		if !strings.Contains(output, phrase) {
			t.Errorf("missing expected text in explainer output:\nExpected phrase: %q\nActual output:\n%s", phrase, output)
		}
	}
}
