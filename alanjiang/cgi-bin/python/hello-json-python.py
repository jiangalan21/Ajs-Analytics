#!/usr/bin/python3
import json
import os
from datetime import datetime

print("Content-Type: application/json")
print()

now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
user_ip = os.environ.get('REMOTE_ADDR', 'Unknown')

json_data = {
    "greetings from": "Alan",
    "language": "Python 3",
    "generated_at": now,
    "user_ip": user_ip
}

print(json.dumps(json_data))
    