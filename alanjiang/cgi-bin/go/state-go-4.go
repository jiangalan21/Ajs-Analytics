package main

import (
	"fmt"
	"time"
)

func main() {
	expires := time.Now().Add(-3600 * time.Second).Format(time.RFC1123)
	
	fmt.Printf("Set-Cookie: session_data=; Path=/; Expires=%s\n", expires)
	fmt.Printf("Set-Cookie: user_ip=; Path=/; Expires=%s\n", expires)
	fmt.Printf("Set-Cookie: generated_at=; Path=/; Expires=%s\n", expires)
	fmt.Println("Location: state-go-3")
	fmt.Println()
}