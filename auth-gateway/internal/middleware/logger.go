// File: internal/middleware/logger.go
package middleware

import (
	"context"
	"net/http"
	"time"

	"go.uber.org/zap"
)

// private key to store/retrieve the logger
type ctxKeyLogger struct{}

// GetLoggerFrom returns the per-request logger, or the global fallback.
func GetLoggerFrom(ctx context.Context) *zap.Logger {
	if l, ok := ctx.Value(ctxKeyLogger{}).(*zap.Logger); ok && l != nil {
		return l
	}
	return zap.L()
}

// LoggingMiddleware wraps a handler, adds request context (id, path, method)
// to the logger, records duration/size, and recovers panics.
func LoggingMiddleware(base *zap.Logger) func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		// derive logger once
		reqID := GetRequestID(r.Context())
		l := base.With(
			zap.String("trace_id", reqID),
			zap.String("method", r.Method),
			zap.String("path", r.URL.Path),
			zap.String("remote_addr", r.RemoteAddr),
			zap.String("user_agent", r.UserAgent()),
		)

		// stash in ctx so deeper code can do middleware.From(ctx)
		ctx := context.WithValue(r.Context(), ctxKeyLogger{}, l)
		r = r.WithContext(ctx)

		// wrap ResponseWriter to capture status/bytes
		ww := &responseWriter{ResponseWriter: rw, status: http.StatusOK}

		start := time.Now()
		defer func() {
			l.Info("request completed",
				zap.Int("status", ww.status),
				zap.Int("size", ww.written),
				zap.Duration("duration", time.Since(start)),
			)
		}()

		l.Info("request started")
		next(ww, r)
	}
}

// minimal wrapper to grab status/bytes
type responseWriter struct {
	http.ResponseWriter
	status  int
	written int
}

func (w *responseWriter) WriteHeader(code int) {
	w.status = code
	w.ResponseWriter.WriteHeader(code)
}

func (w *responseWriter) Write(b []byte) (int, error) {
	n, err := w.ResponseWriter.Write(b)
	w.written += n
	return n, err
}
