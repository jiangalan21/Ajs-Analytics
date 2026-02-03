package main

import (
	"fmt"
	"html"
	"os"
	"sort"
)

func main() {
	fmt.Println("Content-Type: text/html")
	fmt.Println()
	
	fmt.Println(`<!DOCTYPE html>
<html>
<head><title>Go Environment Variables</title></head>
<body>
    <h1>Go Environment Variables</h1>
    <hr>
    <table border="1" cellpadding="5">
        <tr>
            <th>Variable</th>
            <th>Value</th>
        </tr>`)

	env := os.Environ()
	sort.Strings(env)
	
	for _, e := range env {
		pair := splitEnv(e)
		if len(pair) == 2 {
			fmt.Printf("        <tr><td>%s</td><td>%s</td></tr>\n", 
				html.EscapeString(pair[0]), 
				html.EscapeString(pair[1]))
		}
	}

	fmt.Println(`    </table>
</body>
</html>`)
}

func splitEnv(s string) []string {
	for i := 0; i < len(s); i++ {
		if s[i] == '=' {
			return []string{s[:i], s[i+1:]}
		}
	}
	return []string{s}
}