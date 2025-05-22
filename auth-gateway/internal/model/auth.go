package model

type LoginFlow struct {
	ID         string `json:"id"`
	CsrfToken  string `json:"csrf_token,omitempty"`
	Identifier string `json:"identifier,omitempty"`
}
