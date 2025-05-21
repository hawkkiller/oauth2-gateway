package auth

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

// CreateOAuth2Flow creates a new OAuth2 login flow in Hydra
func (h *Handler) CreateOAuth2Flow(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	hydraConfig := h.ory.Hydra.GetConfig()
	hydraURL := hydraConfig.URL

	// Return Redirect to Hydra
	http.Redirect(w, r, hydraURL+"/oauth2/auth?"+r.URL.Query().Encode(), http.StatusFound)
}
