package auth

import (
	"net/http"

	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/util"
	"github.com/julienschmidt/httprouter"
)

// CreateLoginFlow creates a new login flow in Kratos
func (h *Handler) CreateLoginFlow(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	flow, outCookies, err := h.service.CreateLoginFlow(r.Context(), r.Cookies())

	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	for _, cookie := range outCookies {
		http.SetCookie(w, cookie)
	}

	util.WriteJSON(w, http.StatusOK, flow)
}

// GetLoginFlow gets a login flow from Kratos
func (h *Handler) GetLoginFlow(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {

	id := r.URL.Query().Get("id")

	if id == "" {
		util.WriteError(w, http.StatusBadRequest, "id is required")
		return
	}

	flow, outCookies, err := h.service.GetLoginFlow(r.Context(), id, r.Cookies())

	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}

	for _, cookie := range outCookies {
		http.SetCookie(w, cookie)
	}

	util.WriteJSON(w, http.StatusOK, flow)
}
