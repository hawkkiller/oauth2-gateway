package auth

import (
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/proxy"
	"github.com/julienschmidt/httprouter"
)

type Handler struct {
	hydra proxy.Hydra
}

func NewHandler(hydra proxy.Hydra) *Handler {
	return &Handler{hydra: hydra}
}

func (h *Handler) RegisterRoutes(r *httprouter.Router) {
	r.GET("/oauth2/auth", h.CreateOAuth2Flow)
	r.GET("/login", h.CreateLoginFlow)
}
