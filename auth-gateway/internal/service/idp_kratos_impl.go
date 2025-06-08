package service

import (
	"context"
	"fmt"
	"net/http"

	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/middleware"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/model"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/ory"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/response"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/util"
	kratos "github.com/ory/kratos-client-go"
	"go.uber.org/zap"
)

type authServiceKratos struct {
	kratosPublic *kratos.APIClient
}

func NewAuthServiceKratos(client *kratos.APIClient) IDPService {
	return &authServiceKratos{kratosPublic: client}
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

func (s *authServiceKratos) CreateLoginFlow(ctx context.Context, challenge string, cookies []*http.Cookie) (model.LoginFlow, []*http.Cookie, error) {
	logger := middleware.GetLoggerFrom(ctx)
	logger.Info("creating login flow", zap.String("challenge", challenge), zap.Int("cookies_count", len(cookies)))

	if challenge == "" {
		logger.Error("challenge is required")
		return model.LoginFlow{}, nil, response.NewValidation(map[string]string{"challenge": "required"})
	}

	logger.Debug("sending create browser login flow request to Kratos")
	req := s.kratosPublic.FrontendAPI.CreateBrowserLoginFlow(ctx)
	req.Cookie(util.ConcatCookies(cookies))
	req.LoginChallenge(challenge)

	flow, res, err := req.Execute()
	if err != nil {
		logger.Error("failed to create login flow", zap.Error(err))
		return model.LoginFlow{}, nil, err
	}

	csrfToken := findCsrfInNodes(flow.Ui.GetNodes())
	identifier := findIdentifierInNodes(flow.Ui.GetNodes())

	logger.Info("login flow created successfully",
		zap.String("flow_id", flow.Id),
		zap.Bool("has_csrf_token", csrfToken != ""),
		zap.Bool("has_identifier", identifier != ""),
		zap.Int("response_cookies_count", len(res.Cookies())))

	return model.LoginFlow{ID: flow.Id, CsrfToken: csrfToken, Identifier: identifier}, res.Cookies(), nil
}

func (s *authServiceKratos) GetLoginFlow(ctx context.Context, id string, cookies []*http.Cookie) (model.LoginFlow, []*http.Cookie, error) {
	logger := middleware.GetLoggerFrom(ctx)
	logger.Info("getting login flow", zap.String("flow_id", id), zap.Int("cookies_count", len(cookies)))

	if id == "" {
		logger.Error("flow ID is required")
		return model.LoginFlow{}, nil, response.NewValidation(map[string]string{"id": "required"})
	}

	logger.Debug("sending get login flow request to Kratos")
	flow, res, err := s.kratosPublic.FrontendAPI.
		GetLoginFlow(ctx).
		Cookie(util.ConcatCookies(cookies)).
		Id(id).
		Execute()

	if err != nil {
		logger.Error("failed to get login flow", zap.String("flow_id", id), zap.Error(err))
		openApiErr, ok := ory.UnpackKratosGenericOpenApiError(err)

		if !ok {
			return model.LoginFlow{}, nil, err
		}

		handledErr := handleKratosOpenAPIError(openApiErr)
		logger.Error("handled Kratos OpenAPI error", zap.Error(err), zap.Error(handledErr))
		return model.LoginFlow{}, nil, handledErr
	}

	csrfToken := findCsrfInNodes(flow.Ui.GetNodes())
	identifier := findIdentifierInNodes(flow.Ui.GetNodes())

	logger.Info("login flow retrieved successfully",
		zap.String("flow_id", flow.Id),
		zap.Bool("has_csrf_token", csrfToken != ""),
		zap.Bool("has_identifier", identifier != ""),
		zap.Int("response_cookies_count", len(res.Cookies())))

	return model.LoginFlow{
		ID:         flow.Id,
		CsrfToken:  csrfToken,
		Identifier: identifier,
	}, res.Cookies(), nil
}

func (s *authServiceKratos) SendLoginEmailCode(
	ctx context.Context,
	flowID string,
	cookies []*http.Cookie,
	form *model.SendLoginEmailCodeForm,
) (model.LoginFlow, []*http.Cookie, error) {
	logger := middleware.GetLoggerFrom(ctx)
	logger.Info("sending login email code",
		zap.String("flow_id", flowID),
		zap.String("identifier", form.Identifier),
		zap.Bool("has_csrf_token", form.CsrfToken != ""),
		zap.Int("cookies_count", len(cookies)))

	var validationErrors map[string]string = make(map[string]string)

	if flowID == "" {
		logger.Error("flow ID is required")
		return model.LoginFlow{}, nil, response.NewValidation(map[string]string{"flow_id": "required"})
	}

	if form.Identifier == "" {
		validationErrors["identifier"] = "required"
	}

	if form.CsrfToken == "" {
		validationErrors["csrf_token"] = "required"
	}

	if len(validationErrors) > 0 {
		logger.Error("validation failed for send login email code", zap.Any("errors", validationErrors))
		return model.LoginFlow{}, nil, response.NewValidation(validationErrors)
	}

	logger.Debug("sending update login flow request to Kratos for email code")
	_, res, err := s.kratosPublic.FrontendAPI.UpdateLoginFlow(ctx).
		Cookie(util.ConcatCookies(cookies)).
		Flow(flowID).UpdateLoginFlowBody(kratos.UpdateLoginFlowBody{
		UpdateLoginFlowWithCodeMethod: &kratos.UpdateLoginFlowWithCodeMethod{
			Method:     "code",
			Identifier: &form.Identifier,
			CsrfToken:  form.CsrfToken,
		},
	}).Execute()

	if err != nil {
		openApiErr, ok := ory.UnpackKratosGenericOpenApiError(err)

		if !ok {
			return model.LoginFlow{}, nil, err
		}

		if loginFlow, ok := openApiErr.Model().(kratos.LoginFlow); ok {
			stateStr := ""
			if state, ok := loginFlow.State.(string); ok {
				stateStr = state
			}
			logger.Info("login flow state from error response", zap.String("state", stateStr), zap.String("flow_id", loginFlow.Id))
			if stateStr == "sent_email" {
				logger.Info("email code sent successfully", zap.String("flow_id", loginFlow.Id), zap.String("identifier", form.Identifier))
				return model.LoginFlow{
					ID:         loginFlow.Id,
					CsrfToken:  findCsrfInNodes(loginFlow.Ui.GetNodes()),
					Identifier: form.Identifier,
				}, nil, nil
			}

			logger.Error("unexpected login flow state", zap.String("state", stateStr), zap.String("flow_id", loginFlow.Id))
			return model.LoginFlow{}, res.Cookies(), response.ErrNotFound
		}

		logger.Error("failed to extract login flow from error response")
	}

	return model.LoginFlow{}, res.Cookies(), response.ErrInternal
}

func (s *authServiceKratos) SubmitLoginEmailCode(
	ctx context.Context,
	flowID string,
	cookies []*http.Cookie,
	form *model.SubmitLoginEmailCodeForm,
) (model.SubmitLoginEmailCodeResponse, []*http.Cookie, error) {
	logger := middleware.GetLoggerFrom(ctx)
	logger.Info("submitting login email code",
		zap.String("flow_id", flowID),
		zap.String("identifier", form.Identifier),
		zap.Bool("has_code", form.Code != ""),
		zap.Bool("has_csrf_token", form.CsrfToken != ""),
		zap.Int("cookies_count", len(cookies)))

	var validationErrors map[string]string = make(map[string]string)

	if form.Identifier == "" {
		validationErrors["identifier"] = "required"
	}

	if form.Code == "" {
		validationErrors["code"] = "required"
	}

	if form.CsrfToken == "" {
		validationErrors["csrf_token"] = "required"
	}

	if len(validationErrors) > 0 {
		logger.Error("validation failed for submit login email code", zap.Any("errors", validationErrors))
		return model.SubmitLoginEmailCodeResponse{}, nil, response.NewValidation(validationErrors)
	}

	logger.Debug("sending update login flow request to Kratos for code verification")
	login, res, err := s.kratosPublic.FrontendAPI.UpdateLoginFlow(ctx).
		Cookie(util.ConcatCookies(cookies)).
		Flow(flowID).UpdateLoginFlowBody(kratos.UpdateLoginFlowBody{
		UpdateLoginFlowWithCodeMethod: &kratos.UpdateLoginFlowWithCodeMethod{
			Method:     "code",
			Code:       &form.Code,
			Identifier: &form.Identifier,
			CsrfToken:  form.CsrfToken,
		},
	}).Execute()

	if err != nil {
		logger.Error("failed to submit login email code", zap.String("flow_id", flowID), zap.Error(err))
		openApiErr, ok := ory.UnpackKratosGenericOpenApiError(err)

		if !ok {
			return model.SubmitLoginEmailCodeResponse{}, nil, err
		}

		handledErr := handleKratosOpenAPIError(openApiErr)
		logger.Error("handled Kratos OpenAPI error for code submission", zap.Error(err), zap.Error(handledErr))
		return model.SubmitLoginEmailCodeResponse{}, res.Cookies(), handledErr
	}

	logger.Info("login email code submitted successfully",
		zap.String("flow_id", flowID),
		zap.String("session_id", login.Session.Id),
		zap.Int("response_cookies_count", len(res.Cookies())))

	return model.SubmitLoginEmailCodeResponse{
		Session: model.Session{ID: login.Session.Id},
	}, res.Cookies(), nil
}
