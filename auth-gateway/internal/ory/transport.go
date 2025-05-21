package ory

import (
	"crypto/tls"
	"net"
	"net/http"
	"time"

	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/config"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

type Clients struct {
	Hydra Hydra
}

func NewClients(config *config.AppConfig) *Clients {
	client := defaultHTTPClient()

	hydra := NewHydra(config.HydraConfig.AdminURL, client)

	return &Clients{Hydra: hydra}
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
