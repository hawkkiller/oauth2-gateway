// File: internal/middleware/requestid.go
package middleware

import (
	"context"
	"net/http"

	"github.com/google/uuid"
)

type ctxKeyRequestID struct{}

// RequestID returns the request ID stored in ctx, or empty string.
func GetRequestID(ctx context.Context) string {
	if v, ok := ctx.Value(ctxKeyRequestID{}).(string); ok {
		return v
	}
	return ""
}

// RequestIDMiddleware ensures every request has an X-Request-ID header.
// It puts that ID into the request context and echoes it back in the response
// so callers can correlate.
func RequestIDMiddleware(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	id := r.Header.Get("X-Request-ID")
	if id == "" {
		id = uuid.NewString()
	}

	// surface for downstream and client
	ctx := context.WithValue(r.Context(), ctxKeyRequestID{}, id)
	rw.Header().Set("X-Request-ID", id)

	next(rw, r.WithContext(ctx))
}
