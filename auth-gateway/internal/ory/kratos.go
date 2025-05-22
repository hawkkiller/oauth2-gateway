package ory

import (
	"fmt"
	"net/http"
	"net/url"

	kratos "github.com/ory/kratos-client-go"
)

func NewKratosPublic(URL string, httpClient *http.Client) (*kratos.APIClient, error) {
	parsedURL, err := url.Parse(URL)
	if err != nil {
		return nil, err
	}

	if parsedURL.Scheme == "" {
		return nil, fmt.Errorf("kratos URL must have scheme, either http or https")
	}

	cfg := kratos.NewConfiguration()
	cfg.Scheme = parsedURL.Scheme
	cfg.Host = parsedURL.Host
	cfg.HTTPClient = httpClient

	client := kratos.NewAPIClient(cfg)

	return client, nil
}
