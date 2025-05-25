package model

type LoginFlow struct {
	ID         string `json:"id"`
	CsrfToken  string `json:"csrf_token,omitempty"`
	Identifier string `json:"identifier,omitempty"`
}

type SendLoginEmailCodeForm struct {
	Identifier string `json:"identifier"`
	CsrfToken  string `json:"csrf_token"`
}

type UpdateLoginFlowResponse struct {
	Session Session `json:"session"`
}

type Session struct {
	ID string `json:"id"`
}
