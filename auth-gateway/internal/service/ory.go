package service

import (
	"context"
	"fmt"
	"net/http"
	"net/url"

	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/model"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/ory"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/util"
	kratos "github.com/ory/kratos-client-go"
)

type authServiceOry struct {
	clients *ory.Clients
}

func NewAuthServiceORY(clients *ory.Clients) AuthService {
	return &authServiceOry{clients: clients}
}

func findCsrfInNodes(nodes []kratos.UiNode) string {
	for _, node := range nodes {
		if node.Type == "input" && node.Attributes.UiNodeInputAttributes.Name == "csrf_token" {
			if value, ok := node.Attributes.UiNodeInputAttributes.Value.(string); ok {
				return value
			}
		}
	}

	return ""
}

func findIdentifierInNodes(nodes []kratos.UiNode) string {
	for _, node := range nodes {
		if node.Type == "input" && node.Attributes.UiNodeInputAttributes.Name == "identifier" {
			return node.Attributes.UiNodeInputAttributes.Value.(string)
		}
	}

	return ""
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

	csrfToken := findCsrfInNodes(flow.Ui.GetNodes())
	identifier := findIdentifierInNodes(flow.Ui.GetNodes())

	return model.LoginFlow{ID: flow.Id, CsrfToken: csrfToken, Identifier: identifier}, res.Cookies(), nil
}

func (s *authServiceOry) GetLoginFlow(ctx context.Context, id string, cookies []*http.Cookie) (model.LoginFlow, []*http.Cookie, error) {
	req := s.clients.KratosPublic.FrontendAPI.GetLoginFlow(ctx)
	req.Cookie(util.ConcatCookies(cookies))
	req.Id(id)

	flow, res, err := req.Execute()
	if err != nil {
		return model.LoginFlow{}, nil, err
	}

	csrfToken := findCsrfInNodes(flow.Ui.GetNodes())
	identifier := findIdentifierInNodes(flow.Ui.GetNodes())

	return model.LoginFlow{
		ID:         flow.Id,
		CsrfToken:  csrfToken,
		Identifier: identifier,
	}, res.Cookies(), nil
}
