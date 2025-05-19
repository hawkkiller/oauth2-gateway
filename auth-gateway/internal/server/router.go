package server

import (
	"log"
	"net/http"

	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/config"
	"github.com/julienschmidt/httprouter"
)

// New returns a ready-to-use httprouter with
//   - recovery + structured logging
//   - CORS
//   - health / readiness probes
//   - Swagger UI at /swagger/
func NewRouter(appConfig *config.AppConfig) *httprouter.Router {
	r := httprouter.New()

	r.PanicHandler = recovery()

	return r
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
