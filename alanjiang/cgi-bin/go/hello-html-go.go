package main

import (
	"fmt"
	"os"
	"time"
)

func main() {
	now := time.Now().Format("2006-01-02 15:04:05")
	userIP := os.Getenv("REMOTE_ADDR")
	if userIP == "" {
		userIP = "Unknown"
	}

	fmt.Println("Content-Type: text/html")
	fmt.Println()
	fmt.Printf(`
<!DOCTYPE html>
<html>
<head><title>Hello Go</title></head>
<body>
    <h1>Greetings from Alan!</h1>
    <p><b>Language:</b> Go</p>
    <p><b>Generated at:</b> %s</p>
    <p><b>Your IP Address:</b> %s</p>
</body>
</html>
`, now, userIP)
}