package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/config"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/server"
	"go.uber.org/zap"
)

func main() {
	logger, err := zap.NewProduction()

	if err != nil {
		panic("cannot create zap logger: " + err.Error())
	}

	defer logger.Sync()
	zap.ReplaceGlobals(logger)

	sugar := logger.Sugar()

	appConfig, err := config.LoadConfig()
	if err != nil {
		sugar.Fatalf("Failed to load config: %v", err)
	}

	router := server.NewRouter(appConfig)

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

	// Run the server in a goroutine so it doesn’t block.
	go func() {
		sugar.Infof("proxy listening on port %d", appConfig.ServerConfig.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			sugar.Fatalf("http server error: %v", err)
		}
	}()

	<-done

	sugar.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		sugar.Errorf("graceful shutdown failed: %v; forcing close", err)
		if cerr := srv.Close(); cerr != nil {
			sugar.Errorf("server close error: %v", cerr)
		}
	}

	sugar.Info("server stopped gracefully")
}
