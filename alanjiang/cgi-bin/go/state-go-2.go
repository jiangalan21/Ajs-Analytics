package main

import (
	"fmt"
	"io/ioutil"
	"net/url"
	"os"
	"time"
)

func main() {
	bodyBytes, _ := ioutil.ReadAll(os.Stdin)
	bodyStr := string(bodyBytes)
	
	values, _ := url.ParseQuery(bodyStr)
	message := values.Get("user_data")
	ip := values.Get("user_ip")
	timeVal := values.Get("generated_at")

	expires := time.Now().Add(3600 * time.Second).Format(time.RFC1123)
	
	fmt.Printf("Set-Cookie: session_data=%s; Path=/; Expires=%s\n", 
		url.QueryEscape(message), expires)
	fmt.Printf("Set-Cookie: user_ip=%s; Path=/; Expires=%s\n", 
		url.QueryEscape(ip), expires)
	fmt.Printf("Set-Cookie: generated_at=%s; Path=/; Expires=%s\n", 
		url.QueryEscape(timeVal), expires)
	fmt.Println("Location: state-go-3")
	fmt.Println()
}