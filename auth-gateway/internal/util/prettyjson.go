package util

import (
	"encoding/json"

	"go.uber.org/zap/buffer"
	"go.uber.org/zap/zapcore"
)

// prettyJSONEncoder wraps a zapcore.Encoder and re-formats the output with json.MarshalIndent.
type prettyJSONEncoder struct{ zapcore.Encoder }

func (p *prettyJSONEncoder) Clone() zapcore.Encoder {
	return &prettyJSONEncoder{p.Encoder.Clone()}
}

func (p *prettyJSONEncoder) EncodeEntry(e zapcore.Entry, fs []zapcore.Field) (*buffer.Buffer, error) {
	// Encode once with the inner (fast) encoder
	buf, err := p.Encoder.EncodeEntry(e, fs)
	if err != nil {
		return nil, err
	}

	// Copy the bytes because zap’s buffer is pooled
	line := append([]byte(nil), buf.Bytes()...)
	buf.Free() // return the original buffer to the pool

	// Try to re-indent
	var v any
	if err := json.Unmarshal(line, &v); err != nil {
		// Not valid JSON – give the original line back
		newBuf := buffer.NewPool().Get()
		newBuf.Write(line)
		return newBuf, nil
	}

	pretty, _ := json.MarshalIndent(v, "", "  ")
	newBuf := buffer.NewPool().Get()
	newBuf.Write(pretty)
	newBuf.AppendByte('\n')
	return newBuf, nil
}
