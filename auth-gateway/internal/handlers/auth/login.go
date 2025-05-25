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
	flow, outCookies, err := h.service.CreateLoginFlow(r.Context(), r.Cookies())

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

	flow, outCookies, err := h.service.GetLoginFlow(r.Context(), id, r.Cookies())

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

	flow, outCookies, err := h.service.SendLoginEmailCode(r.Context(), id, r.Cookies(), &form)

	middleware.GetLoggerFrom(r.Context()).Debug("flow", zap.Any("flow", flow), zap.Any("err", err))

	if err != nil {
		response.WriteError(w, err)
		return
	}

	util.ForwardSetCookieHeader(outCookies, w)
	response.WriteData(w, http.StatusOK, flow)
}
