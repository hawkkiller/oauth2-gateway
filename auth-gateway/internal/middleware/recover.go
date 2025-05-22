package middleware

import (
	"net/http"
)

func RecoverMiddleware(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	defer func() {
		if rec := recover(); rec != nil {
			http.Error(rw, "internal server error", http.StatusInternalServerError)
		}
	}()

	next(rw, r)
}
