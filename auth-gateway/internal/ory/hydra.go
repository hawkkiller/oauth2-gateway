package ory

import (
	"fmt"
	"net/http"
	"net/url"

	hydra "github.com/ory/hydra-client-go/v2"
)

func NewHydraAdmin(adminUrl string, httpClient *http.Client) (*hydra.APIClient, error) {
	parsedAdminURL, err := url.Parse(adminUrl)
	if err != nil {
		return nil, err
	}

	if parsedAdminURL.Scheme == "" {
		return nil, fmt.Errorf("hydra admin URL must have scheme, either http or https")
	}

	cfg := hydra.NewConfiguration()
	cfg.Scheme = parsedAdminURL.Scheme
	cfg.Host = parsedAdminURL.Host
	cfg.HTTPClient = httpClient

	return hydra.NewAPIClient(cfg), nil
}

func NewHydraPublic(publicUrl string, httpClient *http.Client) (*hydra.APIClient, error) {
	parsedPublicURL, err := url.Parse(publicUrl)
	if err != nil {
		return nil, err
	}

	cfg := hydra.NewConfiguration()
	cfg.Scheme = parsedPublicURL.Scheme
	cfg.Host = parsedPublicURL.Host + parsedPublicURL.Path
	cfg.HTTPClient = httpClient

	return hydra.NewAPIClient(cfg), nil
}
