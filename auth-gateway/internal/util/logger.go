package util

import (
	"go.uber.org/zap"
)

func NewLogger(dev bool) (*zap.Logger, error) {
	return zap.NewProduction()
}
