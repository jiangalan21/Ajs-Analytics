#!/usr/bin/python3
import os, sys, urllib.parse
from http import cookies

content_length = int(os.environ.get('CONTENT_LENGTH', 0))
raw_body = sys.stdin.read(content_length)
parsed_data = urllib.parse.parse_qs(raw_body)

message = parsed_data.get('user_data', [''])[0]
ip = parsed_data.get('user_ip', [''])[0]
time_val = parsed_data.get('generated_at', [''])[0]

c = cookies.SimpleCookie()
c["session_data"] = message
c["user_ip"] = ip
c["generated_at"] = time_val

for key in ["session_data", "user_ip", "generated_at"]:
    c[key]["path"] = "/"
    c[key]["max-age"] = 3600

print(c.output())
print("Location: state-python-3.py")
print()