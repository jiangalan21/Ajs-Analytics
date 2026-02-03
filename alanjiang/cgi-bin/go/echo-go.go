package main

import (
	"fmt"
	"html"
	"io/ioutil"
	"os"
	"strings"
	"time"
)

func main() {
	now := time.Now().Format("2006-01-02 15:04:05")
	
	method := os.Getenv("HTTP_X_HTTP_METHOD_OVERRIDE")
	if method == "" {
		method = os.Getenv("REQUEST_METHOD")
	}
	if method == "" {
		method = "GET"
	}
	method = strings.ToUpper(method)
	
	protocol := os.Getenv("SERVER_PROTOCOL")
	if protocol == "" {
		protocol = "HTTP/1.1"
	}
	
	userAgent := os.Getenv("HTTP_USER_AGENT")
	if userAgent == "" {
		userAgent = "Unknown"
	}
	
	userIP := os.Getenv("REMOTE_ADDR")
	if userIP == "" {
		userIP = "Unknown"
	}
	
	hostname := os.Getenv("HTTP_HOST")
	if hostname == "" {
		hostname = "Unknown"
	}
	
	queryString := os.Getenv("QUERY_STRING")
	
	bodyData := ""
	if method != "GET" {
		bodyBytes, _ := ioutil.ReadAll(os.Stdin)
		bodyData = string(bodyBytes)
	}

	fmt.Println("Content-Type: text/html")
	fmt.Println()
	fmt.Printf(`
<!DOCTYPE html>
<html>
<head><title>Go Echo</title></head>
<body>
    <h1>Go Request Echo</h1>
    <hr>
    <p><b>Hostname:</b> %s</p>
    <p><b>Date/Time:</b> %s</p>
    <p><b>User Agent:</b> %s</p>
    <p><b>IP Address:</b> %s</p>
    <p><b>HTTP Method:</b> %s</p>
    <p><b>Protocol:</b> %s</p>
    <p><b>Query String:</b> %s</p>
    <p><b>Message Body:</b> %s</p>
</body>
</html>
`, html.EscapeString(hostname), now, html.EscapeString(userAgent), 
   html.EscapeString(userIP), html.EscapeString(method), 
   html.EscapeString(protocol), html.EscapeString(queryString), 
   html.EscapeString(bodyData))
}