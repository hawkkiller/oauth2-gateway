package auth

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

// CreateOAuth2Flow creates a new OAuth2 login flow in Hydra
func (h *Handler) CreateOAuth2Flow(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	oauth2Url := h.service.GetOAuth2URL(r.URL.Query())

	// Return Redirect to Hydra
	http.Redirect(w, r, oauth2Url, http.StatusFound)
}
