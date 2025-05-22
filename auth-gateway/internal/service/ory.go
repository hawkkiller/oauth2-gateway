package service

import (
	"context"
	"fmt"
	"net/http"
	"net/url"

	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/model"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/ory"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/util"
)

type authServiceOry struct {
	clients *ory.Clients
}

func NewAuthServiceORY(clients *ory.Clients) AuthService {
	return &authServiceOry{clients: clients}
}

func (s *authServiceOry) GetOAuth2URL(query url.Values) string {
	cfg := s.clients.HydraPublic.GetConfig()

	// concat scheme, host and /oauth2/auth
	return fmt.Sprintf("%s://%s/oauth2/auth?%s", cfg.Scheme, cfg.Host, query.Encode())
}

func (s *authServiceOry) CreateLoginFlow(ctx context.Context, cookies []*http.Cookie) (model.LoginFlow, []*http.Cookie, error) {
	req := s.clients.KratosPublic.FrontendAPI.CreateBrowserLoginFlow(ctx)
	req.Cookie(util.ConcatCookies(cookies))

	flow, res, err := req.Execute()
	if err != nil {
		return model.LoginFlow{}, nil, err
	}

	return model.LoginFlow{ID: flow.Id}, res.Cookies(), nil
}
