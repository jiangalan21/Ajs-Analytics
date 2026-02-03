package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
	"time"
)

type EchoResponse struct {
	Hostname     string `json:"hostname"`
	DateTime     string `json:"datetime"`
	UserAgent    string `json:"user_agent"`
	IPAddress    string `json:"ip_address"`
	HTTPMethod   string `json:"http_method"`
	Protocol     string `json:"protocol"`
	QueryString  string `json:"query_string"`
	MessageBody  string `json:"message_body"`
}

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

	response := EchoResponse{
		Hostname:    hostname,
		DateTime:    now,
		UserAgent:   userAgent,
		IPAddress:   userIP,
		HTTPMethod:  method,
		Protocol:    protocol,
		QueryString: queryString,
		MessageBody: bodyData,
	}

	fmt.Println("Content-Type: application/json")
	fmt.Println()

	jsonData, _ := json.MarshalIndent(response, "", "  ")
	fmt.Println(string(jsonData))
}