package service

import (
	"context"
	"net/http"
	"net/url"

	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/model"
)

type AuthService interface {
	// GetOAuth2URL returns the URL of the OAuth2 provider
	GetOAuth2URL(query url.Values) string
	CreateLoginFlow(ctx context.Context, cookies []*http.Cookie) (model.LoginFlow, []*http.Cookie, error)
}
