package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"peekaboo/api"
	"peekaboo/awsclient"
	"peekaboo/config"
	"peekaboo/db"
	"peekaboo/services"
)

func main() {
	log.Println("Starting Cloud Cost Explainer MVP Backend...")

	// 1. Load configuration
	cfg := config.LoadConfig()
	log.Printf("Loaded config: Port=%s, DBPath=%s, AWSMockMode=%v", cfg.Port, cfg.DBPath, cfg.AWSMockMode)

	// 2. Initialize SQLite Database
	database, err := db.InitDB(cfg.DBPath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	log.Println("SQLite database initialized successfully.")

	// 3. Initialize Repositories and Services
	repo := db.NewRepository(database)

	var client awsclient.AWSClient
	if cfg.AWSMockMode {
		log.Println("Running in AWS MOCK MODE (Zero-config demo mode)")
		client = awsclient.NewMockAWSClient()
	} else {
		log.Println("Running in REAL AWS MODE (Using AWS HTTP APIs)")
		client = awsclient.NewRealAWSClient(cfg.DefaultRegion)
	}

	costService := services.NewCostService(repo, client)

	// Seed initial demo data
	ctx := context.Background()
	_, _ = costService.RunDailyCostExplainer(ctx, "usr-demo-1")

	// 4. Setup API Router
	handler := api.NewAPIHandler(repo, costService)
	router := api.SetupRouter(handler)

	// 5. Start HTTP Server
	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	go func() {
		log.Printf("Cloud Cost Explainer backend server running on http://localhost:%s", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP server error: %v", err)
		}
	}()

	// Graceful shutdown handling
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	log.Println("Shutting down server gracefully...")
	ctxShutdown, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctxShutdown); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited cleanly.")
}
