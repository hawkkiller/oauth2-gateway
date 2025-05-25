package auth

import (
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/service"
	"github.com/julienschmidt/httprouter"
)

type Handler struct {
	idp    service.IDPService
	oauth2 service.OAuth2Service
}

func NewHandler(idp service.IDPService, oauth2 service.OAuth2Service) *Handler {
	return &Handler{idp: idp, oauth2: oauth2}
}

func (h *Handler) RegisterRoutes(r *httprouter.Router) {
	r.GET("/oauth2/auth", h.CreateOAuth2Flow)
	r.GET("/login/browser", h.CreateLoginFlow)
	r.GET("/login/flows", h.GetLoginFlow)
	r.POST("/login/flows/email", h.SendLoginEmailCode)
	r.POST("/login/flows/email/submit", h.SubmitLoginEmailCode)
}
