package auth

import (
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/service"
	"github.com/julienschmidt/httprouter"
)

type Handler struct {
	service service.AuthService
}

func NewHandler(service service.AuthService) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(r *httprouter.Router) {
	r.GET("/oauth2/auth", h.CreateOAuth2Flow)
	r.GET("/login/browser", h.CreateLoginFlow)
	r.GET("/login/flows", h.GetLoginFlow)
}
