package service

import (
	"context"
	"net/http"
	"net/url"

	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/model"
)

type IDPService interface {
	CreateLoginFlow(ctx context.Context, cookies []*http.Cookie) (model.LoginFlow, []*http.Cookie, error)
	GetLoginFlow(ctx context.Context, flowID string, cookies []*http.Cookie) (model.LoginFlow, []*http.Cookie, error)
	SendLoginEmailCode(ctx context.Context, flowID string, cookies []*http.Cookie, form *model.SendLoginEmailCodeForm) (model.LoginFlow, []*http.Cookie, error)
	SubmitLoginEmailCode(ctx context.Context, flowID string, cookies []*http.Cookie, form *model.SubmitLoginEmailCodeForm) (model.SubmitLoginEmailCodeResponse, []*http.Cookie, error)
}

type OAuth2Service interface {
	GetOAuth2URL(query url.Values) string
	AcceptOAuth2LoginChallenge(ctx context.Context, form *model.AcceptOAuth2LoginChallengeForm) (model.AcceptOAuth2LoginChallengeResponse, []*http.Cookie, error)
}
