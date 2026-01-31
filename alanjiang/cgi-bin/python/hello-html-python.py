#!/usr/bin/python3
import os
from datetime import datetime

print("Content-Type: text/html")
print()

now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
user_ip = os.environ.get('REMOTE_ADDR', 'Unknown')

print(f"""
<!DOCTYPE html>
<html>
<head><title>Hello Python</title></head>
<body>
    <h1>Greetings from the Python Team!</h1>
    <p><b>Language:</b> Python 3</p>
    <p><b>Generated at:</b> {now}</p>
    <p><b>Your IP Address:</b> {user_ip}</p>
</body>
</html>
""")