package util

import "net/http"

func ConcatCookies(cookies []*http.Cookie) string {
	var concatString string

	for _, cookie := range cookies {
		concatString += cookie.Name + "=" + cookie.Value + "; "
	}

	return concatString
}
