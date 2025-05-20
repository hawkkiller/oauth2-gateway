package auth

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

// CreateLoginFlow creates a new login flow in Kratos
func (h *Handler) CreateLoginFlow(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
}
