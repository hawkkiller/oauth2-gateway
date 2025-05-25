package model

type LoginFlow struct {
	ID         string `json:"id"`
	CsrfToken  string `json:"csrf_token,omitempty"`
	Identifier string `json:"identifier,omitempty"`
}

type Session struct {
	ID string `json:"id"`
}

type SendLoginEmailCodeForm struct {
	Identifier string `json:"identifier"`
	CsrfToken  string `json:"csrf_token"`
}

type SubmitLoginEmailCodeForm struct {
	Identifier string `json:"identifier"`
	Code       string `json:"code"`
	CsrfToken  string `json:"csrf_token"`
}

type SubmitLoginEmailCodeResponse struct {
	Session Session `json:"session"`
}

type AcceptOAuth2LoginChallengeForm struct {
	Challenge string `json:"challenge"`
	Subject   string `json:"subject"`
}

type AcceptOAuth2LoginChallengeResponse struct {
	RedirectTo string `json:"redirect_to"`
}
