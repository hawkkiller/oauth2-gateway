package ory

import (
	"crypto/tls"
	"net"
	"net/http"
	"time"

	hydra "github.com/ory/hydra-client-go/v2"
	kratos "github.com/ory/kratos-client-go"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

type Clients struct {
	HydraAdmin   *hydra.APIClient
	HydraPublic  *hydra.APIClient
	KratosPublic *kratos.APIClient
}

func NewClients(hydraAdminURL string, hydraPublicURL string, kratosPublicURL string) (*Clients, error) {
	client := defaultHTTPClient()

	hydraAdmin, err := NewHydraAdmin(hydraAdminURL, client)
	if err != nil {
		return nil, err
	}

	hydraPublic, err := NewHydraPublic(hydraPublicURL, client)
	if err != nil {
		return nil, err
	}

	kratosPublic, err := NewKratosPublic(kratosPublicURL, client)
	if err != nil {
		return nil, err
	}

	return &Clients{HydraAdmin: hydraAdmin, HydraPublic: hydraPublic, KratosPublic: kratosPublic}, nil
}

func defaultHTTPClient() *http.Client {
	base := http.DefaultTransport.(*http.Transport).Clone()

	// Sensible knobs for a tiny proxy
	base.DialContext = (&net.Dialer{
		Timeout:   5 * time.Second,
		KeepAlive: 30 * time.Second,
	}).DialContext
	base.MaxIdleConns = 100
	base.MaxIdleConnsPerHost = 20
	base.IdleConnTimeout = 90 * time.Second
	base.TLSHandshakeTimeout = 5 * time.Second
	base.ExpectContinueTimeout = 2 * time.Second
	base.TLSClientConfig = &tls.Config{
		MinVersion: tls.VersionTLS12,
	}

	// Wrap with OpenTelemetry so we get distributed traces “for free”.
	rt := otelhttp.NewTransport(base)

	return &http.Client{
		Transport: rt,
		Timeout:   10 * time.Second,
	}
}
