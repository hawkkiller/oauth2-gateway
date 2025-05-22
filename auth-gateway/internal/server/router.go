package server

import (
	"log"
	"net/http"

	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/config"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/handlers/auth"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/service"
	"github.com/julienschmidt/httprouter"
	"go.uber.org/zap"
)

// New returns a ready-to-use httprouter with
//   - recovery + structured logging
//   - CORS
//   - health / readiness probes
//   - Swagger UI at /swagger/
func NewRouter(appConfig *config.AppConfig, service service.AuthService, logger *zap.SugaredLogger) *httprouter.Router {
	r := httprouter.New()
	r.PanicHandler = recovery()

	// Apply the wrapper to all routes
	r.GET("/healthz", healthz)
	r.GET("/readyz", readyz)

	// Create auth handler
	authHandler := auth.NewHandler(service, logger)
	authHandler.RegisterRoutes(r)

	return r
}

// healthz is a simple health check endpoint.
func healthz(w http.ResponseWriter, _ *http.Request, _ httprouter.Params) {
	w.WriteHeader(http.StatusOK)

	_, _ = w.Write([]byte("OK"))
}

// readyz is a simple readiness check endpoint.
func readyz(w http.ResponseWriter, _ *http.Request, _ httprouter.Params) {
	w.WriteHeader(http.StatusOK)

	_, _ = w.Write([]byte("OK"))
}

// recovery returns a panic-safe handler that logs the panic and
// returns 500 without killing the process.
func recovery() func(http.ResponseWriter, *http.Request, interface{}) {
	return func(w http.ResponseWriter, r *http.Request, rec interface{}) {
		log.Printf("panic: %v (%s %s)", rec, r.Method, r.URL.Path)
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte("internal server error"))
	}
}
