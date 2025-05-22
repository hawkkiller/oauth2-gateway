package util

import (
	"encoding/json"
	"net/http"
)

// Response represents a standardized API response structure
type Response struct {
	OK    bool        `json:"ok"`
	Data  interface{} `json:"data,omitempty"`
	Error interface{} `json:"error,omitempty"`
}

// WriteJSON writes a JSON response with the given status code
func WriteJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	response := Response{
		OK:   true,
		Data: data,
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(response)
}

// WriteError writes an error response with the given status code
func WriteError(w http.ResponseWriter, statusCode int, errorMsg string) {
	response := Response{
		OK:    false,
		Error: errorMsg,
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(response)
}
