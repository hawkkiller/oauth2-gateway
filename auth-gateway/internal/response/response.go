package response

import (
	"encoding/json"
	"errors"
	"net/http"
)

// wire contract
type wrapper struct {
	OK    bool        `json:"ok"`
	Data  any         `json:"data,omitempty"`
	Error *errPayload `json:"error,omitempty"`
}

type errPayload struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details any    `json:"details,omitempty"`
}

// WriteData is unchanged
func WriteData(w http.ResponseWriter, status int, data any) {
	writeJSON(w, status, wrapper{OK: true, Data: data})
}

// WriteError is tiny – it *asks* the error how to serialise itself
func WriteError(w http.ResponseWriter, e error) {
	var he HTTPError
	if ok := errors.As(e, &he); ok {
		writeJSON(w, he.Status(), wrapper{
			OK: false,
			Error: &errPayload{
				Code:    he.Code(),
				Message: he.Error(), // safe for clients
				Details: he.Details(),
			},
		})
		return
	}

	// Fallback: 500
	writeJSON(w, http.StatusInternalServerError, wrapper{
		OK: false,
		Error: &errPayload{
			Code:    "internal_server_error",
			Message: "An internal server error occurred. Our team has been notified.",
			Details: map[string]string{
				"error": e.Error(),
			},
		},
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
