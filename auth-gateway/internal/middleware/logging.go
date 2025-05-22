package middleware

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
	"go.uber.org/zap"
)

// LoggingMiddleware is a middleware that logs the request and response
func LoggingMiddleware(h httprouter.Handle, logger *zap.SugaredLogger) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		logger.Info("Request", "method", r.Method, "url", r.URL.String(), "params", p)
		h(w, r, p)
	}
}
