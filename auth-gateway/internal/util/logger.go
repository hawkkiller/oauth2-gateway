package util

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func NewLogger(dev bool) (*zap.Logger, error) {
	if dev {
		encCfg := zap.NewProductionEncoderConfig()
		encCfg.EncodeTime = zapcore.ISO8601TimeEncoder

		core := zapcore.NewCore(
			&prettyJSONEncoder{zapcore.NewJSONEncoder(encCfg)}, // 👈 our wrapper
			zapcore.Lock(os.Stdout),
			zap.DebugLevel,
		)
		return zap.New(core, zap.AddCaller(), zap.Development()), nil
	}

	return zap.NewProduction()
}
