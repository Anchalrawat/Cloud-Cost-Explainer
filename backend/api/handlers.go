package api

import (
	"encoding/json"
	"net/http"

	"peekaboo/db"
	"peekaboo/services"
)

type APIHandler struct {
	repo        *db.Repository
	costService *services.CostService
}

func NewAPIHandler(repo *db.Repository, costService *services.CostService) *APIHandler {
	return &APIHandler{
		repo:        repo,
		costService: costService,
	}
}

func (h *APIHandler) RootHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"service": "Cloud Cost Explainer MVP Backend API",
		"status":  "online",
		"endpoints": map[string]string{
			"health":             "GET /health",
			"latest_report":      "GET /api/reports/latest",
			"plain_text_summary": "GET /api/explainer/summary",
			"connect_aws":        "POST /api/aws/connect",
			"run_analysis":       "POST /api/reports/run",
		},
	})
}

func (h *APIHandler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, http.StatusOK, map[string]string{
		"status":  "ok",
		"service": "Cloud Cost Explainer MVP Backend",
	})
}

type LoginRequest struct {
	Email string `json:"email"`
	Name  string `json:"name"`
}

func (h *APIHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" {
		req.Email = "demo@example.com"
		req.Name = "Demo User"
	}

	user, err := h.repo.CreateOrGetUser("usr-demo-1", req.Email, req.Name)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to handle login: "+err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"user":    user,
		"token":   "mock-jwt-token-usr-demo-1",
		"message": "Sign in successful",
	})
}

type ConnectAWSRequest struct {
	UserID     string `json:"user_id"`
	AccountID  string `json:"account_id"`
	RoleArn    string `json:"role_arn"`
	ExternalID string `json:"external_id"`
}

func (h *APIHandler) ConnectAWS(w http.ResponseWriter, r *http.Request) {
	var req ConnectAWSRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.UserID == "" {
		req.UserID = "usr-demo-1"
	}
	if req.AccountID == "" {
		req.AccountID = "123456789012"
	}
	if req.RoleArn == "" {
		req.RoleArn = "arn:aws:iam::123456789012:role/PeekabooReadOnlyRole"
	}

	acc, err := h.costService.ConnectAWSAccount(req.UserID, req.AccountID, req.RoleArn, req.ExternalID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to connect AWS account: "+err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"account": acc,
		"status":  "CONNECTED",
		"message": "AWS Read-Only IAM Role successfully connected",
	})
}

func (h *APIHandler) RunExplainerReport(w http.ResponseWriter, r *http.Request) {
	userID := "usr-demo-1"
	summary, err := h.costService.RunDailyCostExplainer(r.Context(), userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to run cost explainer: "+err.Error())
		return
	}

	respondJSON(w, http.StatusOK, summary)
}

func (h *APIHandler) GetLatestReport(w http.ResponseWriter, r *http.Request) {
	userID := "usr-demo-1"
	summary, err := h.costService.GetLatestSummary(r.Context(), userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to fetch latest report: "+err.Error())
		return
	}

	respondJSON(w, http.StatusOK, summary)
}

func (h *APIHandler) GetExplainerText(w http.ResponseWriter, r *http.Request) {
	userID := "usr-demo-1"
	summary, err := h.costService.GetLatestSummary(r.Context(), userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to generate explainer text: "+err.Error())
		return
	}

	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(summary.FormattedSummary.FormattedText))
}

func respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}
