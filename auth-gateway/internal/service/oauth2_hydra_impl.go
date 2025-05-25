package service

import (
	"context"
	"fmt"
	"net/http"
	"net/url"

	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/model"
	hydra "github.com/ory/hydra-client-go/v2"
)

type oauth2ServiceHydra struct {
	hydraPublic *hydra.APIClient
	hydraAdmin  *hydra.APIClient
}

func NewOAuth2ServiceHydra(hydraPublic *hydra.APIClient, hydraAdmin *hydra.APIClient) OAuth2Service {
	return &oauth2ServiceHydra{hydraPublic: hydraPublic, hydraAdmin: hydraAdmin}
}

func (o *oauth2ServiceHydra) GetOAuth2URL(query url.Values) string {
	cfg := o.hydraPublic.GetConfig()

	// concat scheme, host and /oauth2/auth
	return fmt.Sprintf("%s://%s/oauth2/auth?%s", cfg.Scheme, cfg.Host, query.Encode())
}

func (o *oauth2ServiceHydra) AcceptOAuth2LoginChallenge(ctx context.Context, form *model.AcceptOAuth2LoginChallengeForm) (model.AcceptOAuth2LoginChallengeResponse, []*http.Cookie, error) {
	redirect, res, err := o.hydraAdmin.OAuth2API.AcceptOAuth2LoginRequest(ctx).
		LoginChallenge(form.Challenge).
		AcceptOAuth2LoginRequest(*hydra.NewAcceptOAuth2LoginRequest(form.Subject)).
		Execute()

	if err != nil {
		return model.AcceptOAuth2LoginChallengeResponse{}, nil, err
	}

	return model.AcceptOAuth2LoginChallengeResponse{
		RedirectTo: redirect.RedirectTo,
	}, res.Cookies(), nil
}
