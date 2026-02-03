package main

import (
	"fmt"
	"html"
	"net/http"
	"net/url"
	"os"
)

func main() {
	cookieHeader := os.Getenv("HTTP_COOKIE")
	
	displayVal := "No data found."
	userIP := "No IP found."
	generatedAt := "No timestamp found."
	
	if cookieHeader != "" {
		header := http.Header{}
		header.Add("Cookie", cookieHeader)
		request := http.Request{Header: header}
		
		if cookie, err := request.Cookie("session_data"); err == nil {
			displayVal, _ = url.QueryUnescape(cookie.Value)
		}
		if cookie, err := request.Cookie("user_ip"); err == nil {
			userIP, _ = url.QueryUnescape(cookie.Value)
		}
		if cookie, err := request.Cookie("generated_at"); err == nil {
			generatedAt, _ = url.QueryUnescape(cookie.Value)
		}
	}

	fmt.Println("Content-Type: text/html")
	fmt.Println()
	fmt.Printf(`<html>
<body>
    <h1>Session State</h1>
    <p>Stored Data: <b>%s</b></p>
    <p>from IP: <b>%s</b></p>
    <p>Originally set at: <b>%s</b></p>
    <hr>
    <a href="state-go-1">Set Data</a><br>
    <a href="state-go-4">Destroy Data</a>
</body>
</html>
`, html.EscapeString(displayVal), html.EscapeString(userIP), html.EscapeString(generatedAt))
}