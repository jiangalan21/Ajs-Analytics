package main

import (
	"fmt"
	"html"
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
	fmt.Printf(`<!DOCTYPE html>
<html>
<head><title>Go State - Set Data</title></head>
<body>
    <h1>Greetings from Alan!</h1>
    <form action="state-go-2" method="POST">
        <label>What would you like to save?</label>
        <input type="text" name="user_data" placeholder="enter message" required>
        <input type="hidden" name="user_ip" value="%s">
        <input type="hidden" name="generated_at" value="%s">
        <button type="submit">Submit</button>
    </form>
    <a href="/">Home</a>
</body>
</html>
`, html.EscapeString(userIP), now)
}