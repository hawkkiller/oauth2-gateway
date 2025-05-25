package service

import (
	"context"
	"fmt"
	"net/http"
	"net/url"

	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/model"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/ory"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/response"
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

func handleKratosErrorCode(code int64) error {
	if code == 404 {
		return fmt.Errorf("not found: %w", response.ErrNotFound)
	}

	return nil
}

func handleKratosErrorId(errId string) error {
	if errId == "security_csrf_violation" {
		return fmt.Errorf("csrf violation: %w", response.ErrCSRF)
	}

	if errId == "self_service_flow_expired" {
		return fmt.Errorf("flow expired: %w", response.ErrFlowExpired)
	}

	return nil
}

func handleKratosOpenAPIError(openApiErr *kratos.GenericOpenAPIError) error {
	genericErr, ok := ory.UnpackKratosGenericError(openApiErr)
	if !ok {
		return openApiErr
	}

	if errId := genericErr.Id; errId != nil {
		if e := handleKratosErrorId(*errId); e != nil {
			return e
		}
	}

	if code := genericErr.Code; code != nil {
		if e := handleKratosErrorCode(*code); e != nil {
			return e
		}
	}

	return nil
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
	if id == "" {
		return model.LoginFlow{}, nil, response.NewValidation(map[string]string{"id": "required"})
	}

	flow, res, err := s.clients.KratosPublic.FrontendAPI.
		GetLoginFlow(ctx).
		Cookie(util.ConcatCookies(cookies)).
		Id(id).
		Execute()

	if err != nil {
		openApiErr, ok := ory.UnpackKratosGenericOpenApiError(err)

		if !ok {
			return model.LoginFlow{}, nil, err
		}

		return model.LoginFlow{}, nil, handleKratosOpenAPIError(openApiErr)
	}

	csrfToken := findCsrfInNodes(flow.Ui.GetNodes())
	identifier := findIdentifierInNodes(flow.Ui.GetNodes())

	return model.LoginFlow{
		ID:         flow.Id,
		CsrfToken:  csrfToken,
		Identifier: identifier,
	}, res.Cookies(), nil
}

func (s *authServiceOry) SendLoginEmailCode(
	ctx context.Context,
	flowID string,
	cookies []*http.Cookie,
	form *model.SendLoginEmailCodeForm,
) (model.LoginFlow, []*http.Cookie, error) {
	var validationErrors map[string]string = make(map[string]string)

	if form.Identifier == "" {
		validationErrors["identifier"] = "required"
	}

	if form.CsrfToken == "" {
		validationErrors["csrf_token"] = "required"
	}

	if len(validationErrors) > 0 {
		return model.LoginFlow{}, nil, response.NewValidation(validationErrors)
	}

	var req = s.clients.KratosPublic.FrontendAPI.UpdateLoginFlow(ctx).
		Cookie(util.ConcatCookies(cookies)).
		Flow(flowID)

	req = req.UpdateLoginFlowBody(kratos.UpdateLoginFlowBody{
		UpdateLoginFlowWithCodeMethod: &kratos.UpdateLoginFlowWithCodeMethod{
			Method:     "code",
			Identifier: &form.Identifier,
			CsrfToken:  form.CsrfToken,
		},
	})

	_, res, err := req.Execute()

	if err != nil {
		openApiErr, ok := ory.UnpackKratosGenericOpenApiError(err)

		if !ok {
			return model.LoginFlow{}, nil, err
		}

		if loginFlow, ok := openApiErr.Model().(kratos.LoginFlow); ok {
			if loginFlow.State == "sent_email" {
				return model.LoginFlow{
					ID:         loginFlow.Id,
					CsrfToken:  findCsrfInNodes(loginFlow.Ui.GetNodes()),
					Identifier: form.Identifier,
				}, nil, nil
			}

			return model.LoginFlow{}, res.Cookies(), response.ErrNotFound
		}
	}

	return model.LoginFlow{}, res.Cookies(), nil
}
