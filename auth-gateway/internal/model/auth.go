package model

type LoginFlow struct {
	ID         string `json:"id"`
	CsrfToken  string `json:"csrf_token,omitempty"`
	Identifier string `json:"identifier,omitempty"`
}

type UpdateLoginFlowBody struct {
	Code *UpdateLoginFlowWithCodeMethod `json:"code,omitempty"`
}

type UpdateLoginFlowWithCodeMethod struct {
	ID         *string `json:"id"`
	Identifier *string `json:"identifier,omitempty"`
	Method     *string `json:"method"`
	Code       *string `json:"code,omitempty"`
	CsrfToken  string  `json:"csrf_token,omitempty"`
}

type UpdateLoginFlowResponse struct {
	Session Session `json:"session"`
}

type Session struct {
	ID string `json:"id"`
}
