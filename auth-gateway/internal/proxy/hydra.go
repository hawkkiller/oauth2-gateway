package proxy

import (
	"net/http"
)

type HydraConfig struct {
	URL        string
	HttpClient *http.Client
}

type Hydra interface {
	GetConfig() *HydraConfig
}

func NewHydra(url string, httpClient *http.Client) Hydra {
	return &HydraConfig{
		URL:        url,
		HttpClient: httpClient,
	}
}

func (h *HydraConfig) GetConfig() *HydraConfig {
	return h
}
