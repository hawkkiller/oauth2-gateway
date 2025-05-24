package ory

import (
	"errors"
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

func UnpackKratosGenericOpenApiError(err error) (*kratos.GenericOpenAPIError, bool) {
	var genericErr *kratos.GenericOpenAPIError
	if errors.As(err, &genericErr) {
		return genericErr, true
	}

	return nil, false
}

func UnpackKratosGenericError(openApiErr *kratos.GenericOpenAPIError) (*kratos.GenericError, bool) {
	errorModel := openApiErr.Model()

	if errorModel != nil {
		switch errorModel := errorModel.(type) {
		case kratos.ErrorGeneric:
			return &errorModel.Error, true
		default:
			return nil, false
		}
	}

	return nil, false
}
