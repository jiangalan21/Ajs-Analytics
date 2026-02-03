#!/usr/bin/python3
import os
import sys
import json
from datetime import datetime

print("Content-Type: text/html")
print()

now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
method = os.environ.get('HTTP_X_HTTP_METHOD_OVERRIDE', os.environ.get('REQUEST_METHOD', 'GET')).upper()
protocol = os.environ.get('SERVER_PROTOCOL', 'HTTP/1.1')
user_agent = os.environ.get('HTTP_USER_AGENT', 'Unknown')
user_ip = os.environ.get('REMOTE_ADDR', 'Unknown')
hostname = os.environ.get('HTTP_HOST', 'Unknown')

try:
    content_length = int(os.environ.get('CONTENT_LENGTH', 0))
except ValueError:
    content_length = 0  

body_data = sys.stdin.read(content_length) if content_length > 0 else ""

query_string = os.environ.get('QUERY_STRING', '')

print(f"""
<!DOCTYPE html>
<html>
<head><title>Python Echo</title></head>
<body>
    <h1>Python Request Echo</h1>
    <hr>
    <p><b>Hostname:</b> {hostname}</p>
    <p><b>Date/Time:</b> {now}</p>
    <p><b>User Agent:</b> {user_agent}</p>
    <p><b>IP Address:</b> {user_ip}</p>
    <p><b>HTTP Method:</b> {method}</p>
    <p><b>Protocol:</b> {protocol}</p>
    <p><b>Query String:</b> {query_string}</p>
    <p><b>Message Body:</b> {body_data}</p>
</body>
</html>
""")