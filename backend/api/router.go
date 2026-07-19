package api

import (
	"net/http"
)

func SetupRouter(handler *APIHandler) http.Handler {
	mux := http.NewServeMux()

	// Endpoints
	mux.HandleFunc("GET /", handler.RootHandler)
	mux.HandleFunc("GET /health", handler.HealthCheck)
	mux.HandleFunc("POST /api/auth/login", handler.Login)
	mux.HandleFunc("POST /api/aws/connect", handler.ConnectAWS)
	mux.HandleFunc("POST /api/reports/run", handler.RunExplainerReport)
	mux.HandleFunc("GET /api/reports/latest", handler.GetLatestReport)
	mux.HandleFunc("GET /api/explainer/summary", handler.GetExplainerText)

	// Middleware wrapping CORS
	return corsMiddleware(mux)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
