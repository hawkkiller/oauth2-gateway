package config

import (
	"os"

	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

type AppConfig struct {
	DevMode      bool         `env:"DEV" envDefault:"false"`
	ServerConfig ServerConfig `envPrefix:"SERVER_"`
	HydraConfig  HydraConfig  `envPrefix:"HYDRA_"`
	KratosConfig KratosConfig `envPrefix:"KRATOS_"`
}

type ServerConfig struct {
	Port int `env:"PORT" envDefault:"9941"`
}

type HydraConfig struct {
	AdminURL  string `env:"ADMIN_URL"`
	PublicURL string `env:"PUBLIC_URL"`
}

type KratosConfig struct {
	PublicURL string `env:"PUBLIC_URL"`
}

func LoadConfig() (*AppConfig, error) {
	var config AppConfig
	config.DevMode = os.Getenv("DEV") == "true"

	if config.DevMode {
		err := godotenv.Load()

		if err != nil {
			return nil, err
		}
	}

	if err := env.Parse(&config); err != nil {
		return nil, err
	}

	return &config, nil
}
