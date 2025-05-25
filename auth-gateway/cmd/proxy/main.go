package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/config"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/ory"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/server"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/service"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/util"
	"go.uber.org/zap"
)

func main() {
	appConfig, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load config: " + err.Error())
	}

	logger, err := util.NewLogger(appConfig.DevMode)

	if err != nil {
		log.Fatal("Cannot create zap logger: " + err.Error())
	}

	defer logger.Sync()
	zap.ReplaceGlobals(logger)

	sugar := logger.Sugar()

	clients, err := ory.NewClients(
		appConfig.HydraConfig.AdminURL,
		appConfig.HydraConfig.PublicURL,
		appConfig.KratosConfig.PublicURL,
	)

	if err != nil {
		sugar.Fatalf("Failed to create clients: %v", err)
	}

	authService := service.NewAuthServiceORY(clients)
	router := server.NewRouter(appConfig, authService, logger)

	srv := &http.Server{
		Addr:              fmt.Sprintf(":%d", appConfig.ServerConfig.Port),
		Handler:           router,
		ReadHeaderTimeout: 15 * time.Second,
		ReadTimeout:       20 * time.Second,
		WriteTimeout:      20 * time.Second,
		IdleTimeout:       90 * time.Second,
	}

	// Channel for listening to termination signals.
	done := make(chan os.Signal, 1)
	signal.Notify(done, syscall.SIGINT, syscall.SIGTERM)

	// Run the server in a goroutine so it doesn't block.
	go func() {
		sugar.Infof("Proxy listening on port %d", appConfig.ServerConfig.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			sugar.Fatalf("HTTP server error: %v", err)
		}
	}()

	<-done

	sugar.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		sugar.Errorf("Graceful shutdown failed: %v; forcing close", err)
		if cerr := srv.Close(); cerr != nil {
			sugar.Errorf("Server close error: %v", cerr)
		}
	}

	sugar.Info("Server stopped gracefully")
}
