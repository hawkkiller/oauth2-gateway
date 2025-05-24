package service

import (
	"context"
	"net/http"
	"net/url"

	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/model"
)

type AuthService interface {
	GetOAuth2URL(query url.Values) string
	CreateLoginFlow(ctx context.Context, cookies []*http.Cookie) (model.LoginFlow, []*http.Cookie, error)
	GetLoginFlow(ctx context.Context, flowID string, cookies []*http.Cookie) (model.LoginFlow, []*http.Cookie, error)
	UpdateLoginFlow(
		ctx context.Context,
		flowID string,
		cookies []*http.Cookie,
		form *model.UpdateLoginFlowBody,
	) (model.UpdateLoginFlowResponse, []*http.Cookie, error)
}
