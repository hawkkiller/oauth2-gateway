package auth

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/middleware"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/model"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/response"
	"github.com/hawkkiller/oauth2-gateway/auth-gateway/internal/util"
	"github.com/julienschmidt/httprouter"
	"go.uber.org/zap"
)

// CreateLoginFlow creates a new login flow in Kratos
func (h *Handler) CreateLoginFlow(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	loginChallenge := r.URL.Query().Get("challenge")

	flow, outCookies, err := h.idp.CreateLoginFlow(r.Context(), loginChallenge, r.Cookies())

	if err != nil {
		response.WriteError(w, err)
		return
	}

	util.ForwardSetCookieHeader(outCookies, w)
	response.WriteData(w, http.StatusOK, flow)
}

// GetLoginFlow gets a login flow from Kratos
func (h *Handler) GetLoginFlow(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := r.URL.Query().Get("id")

	flow, outCookies, err := h.idp.GetLoginFlow(r.Context(), id, r.Cookies())

	if err != nil {
		response.WriteError(w, err)
		return
	}

	util.ForwardSetCookieHeader(outCookies, w)
	response.WriteData(w, http.StatusOK, flow)
}

func (h *Handler) SendLoginEmailCode(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := r.URL.Query().Get("id")

	body, err := io.ReadAll(r.Body)

	if err != nil {
		response.WriteError(w, err)
		return
	}

	r.Body.Close()
	var form model.SendLoginEmailCodeForm

	if err := json.Unmarshal(body, &form); err != nil {
		response.WriteError(w, err)
		return
	}

	flow, outCookies, err := h.idp.SendLoginEmailCode(r.Context(), id, r.Cookies(), &form)

	if err != nil {
		response.WriteError(w, err)
		return
	}

	util.ForwardSetCookieHeader(outCookies, w)
	response.WriteData(w, http.StatusOK, flow)
}

func (h *Handler) SubmitLoginEmailCode(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := r.URL.Query().Get("id")
	loginChallenge := r.URL.Query().Get("login_challenge")
	logger := middleware.GetLoggerFrom(r.Context())

	body, err := io.ReadAll(r.Body)

	if err != nil {
		response.WriteError(w, err)
		return
	}

	r.Body.Close()
	var form model.SubmitLoginEmailCodeForm

	if err := json.Unmarshal(body, &form); err != nil {
		response.WriteError(w, err)
		return
	}

	submitRes, outCookies, err := h.idp.SubmitLoginEmailCode(r.Context(), id, r.Cookies(), &form)

	if err != nil {
		response.WriteError(w, err)
		return
	}

	util.ForwardSetCookieHeader(outCookies, w)

	redirect, outCookies, err := h.oauth2.AcceptOAuth2LoginChallenge(r.Context(), &model.AcceptOAuth2LoginChallengeForm{
		Challenge: loginChallenge,
		Subject:   submitRes.Session.ID,
	})

	if err != nil {
		logger.Error("failed to accept oauth2 login challenge", zap.Error(err))
		response.WriteError(w, err)
		return
	}

	util.ForwardSetCookieHeader(outCookies, w)
	response.WriteData(w, http.StatusOK, redirect)
}
