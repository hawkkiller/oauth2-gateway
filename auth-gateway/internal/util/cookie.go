package util

import "net/http"

func ForwardSetCookieHeader(cookies []*http.Cookie, w http.ResponseWriter) {
	for _, cookie := range cookies {
		w.Header().Set("Set-Cookie", cookie.String())
	}
}

func ConcatCookies(cookies []*http.Cookie) string {
	var concatString string

	for _, cookie := range cookies {
		concatString += cookie.Name + "=" + cookie.Value + ";"
	}

	return concatString
}
