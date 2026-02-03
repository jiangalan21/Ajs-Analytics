#!/usr/bin/python3
import os
import sys
import json
from datetime import datetime

print("Content-Type: application/json")
print()

now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
method = os.environ.get('REQUEST_METHOD', 'GET')
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

response = {
    "hostname": hostname,
    "datetime": now,
    "user_agent": user_agent,
    "ip_address": user_ip,
    "http_method": method,
    "protocol": protocol,
    "query_string": query_string,
    "message_body": body_data
}

print(json.dumps(response, indent=2))