package util

import (
	"go.uber.org/zap"
)

func NewLogger(dev bool) (*zap.Logger, error) {
	if dev {
		return zap.NewDevelopment()
	}

	return zap.NewProduction()
}
