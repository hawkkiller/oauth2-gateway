package auth

import (
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/ory"
	"github.com/julienschmidt/httprouter"
)

type Handler struct {
	ory *ory.Clients
}

func NewHandler(clients *ory.Clients) *Handler {
	return &Handler{ory: clients}
}

func (h *Handler) RegisterRoutes(r *httprouter.Router) {
	r.GET("/oauth2/auth", h.CreateOAuth2Flow)
	r.GET("/login", h.CreateLoginFlow)
}
