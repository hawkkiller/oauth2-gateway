package config

import "github.com/caarlos0/env/v11"

type AppConfig struct {
	ServerConfig ServerConfig `envPrefix:"SERVER_"`
	HydraConfig  HydraConfig  `envPrefix:"HYDRA_"`
	KratosConfig KratosConfig `envPrefix:"KRATOS_"`
}

type ServerConfig struct {
	Port int `env:"PORT" envDefault:"9941"`
}

type HydraConfig struct {
	AdminURL string `env:"ADMIN_URL"`
}

type KratosConfig struct {
	PublicURL string `env:"PUBLIC_URL"`
}

func LoadConfig() (*AppConfig, error) {
	var config AppConfig
	if err := env.Parse(&config); err != nil {
		return nil, err
	}
	return &config, nil
}
