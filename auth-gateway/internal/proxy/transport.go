package proxy

import (
	"crypto/tls"
	"net"
	"net/http"
	"time"

	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/config"
	hydra "github.com/ory/hydra-client-go/v2"
	kratos "github.com/ory/kratos-client-go"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

type Clients struct {
	Kratos *kratos.APIClient
	Hydra  *hydra.APIClient
}

func NewClients(config *config.AppConfig) (*Clients, error) {
	client := defaultHTTPClient()

	cfgKratos := kratos.NewConfiguration()
	cfgKratos.Servers = kratos.ServerConfigurations{{URL: config.KratosConfig.PublicURL}}
	cfgKratos.HTTPClient = client

	cfgHydra := hydra.NewConfiguration()
	cfgHydra.Servers = hydra.ServerConfigurations{{URL: config.HydraConfig.AdminURL}}
	cfgHydra.HTTPClient = client

	return &Clients{
		Kratos: kratos.NewAPIClient(cfgKratos),
		Hydra:  hydra.NewAPIClient(cfgHydra),
	}, nil
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
