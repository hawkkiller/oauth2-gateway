package response

import "net/http"

// HTTPError carries everything the transport layer needs.
type HTTPError interface {
	error
	Status() int  // HTTP status code
	Code() string // machine-readable error code
	Details() any // optional payload (maps, slices, etc.)
}

// err is a simple implementation; feel free to add fields.
type err struct {
	status  int
	code    string
	msg     string
	details any
}

func (e *err) Error() string { return e.msg }
func (e *err) Status() int   { return e.status }
func (e *err) Code() string  { return e.code }
func (e *err) Details() any  { return e.details }

// Sentinels you can export and re-use.
var (
	ErrCSRF = &err{
		status: http.StatusForbidden,
		code:   "csrf_violation",
		msg:    "CSRF token did not match",
	}
	ErrNotFound = &err{
		status: http.StatusNotFound,
		code:   "not_found",
		msg:    "Resource not found",
	}
	ErrFlowExpired = &err{
		status: http.StatusUnprocessableEntity,
		code:   "flow_expired",
		msg:    "Flow expired",
	}
)

// Helper for ad-hoc validation errors.
func NewValidation(details map[string]string) HTTPError {
	return &err{
		status:  http.StatusUnprocessableEntity,
		code:    "validation_error",
		msg:     "Some fields failed validation",
		details: details,
	}
}
