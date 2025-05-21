package ory

import "net/http"

type KratosConfig struct {
	KratosURL  string
	HTTPClient *http.Client
}

type Kratos interface {
	GetConfig() *KratosConfig
}

func NewKratos(url string, httpClient *http.Client) Kratos {
	return &KratosConfig{
		KratosURL:  url,
		HTTPClient: httpClient,
	}
}

func (k *KratosConfig) GetConfig() *KratosConfig {
	return k
}
