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
<head>
<script src="https://cdn.logr-in.com/LogRocket.min.js" crossorigin="anonymous"></script>
  <script>window.LogRocket && window.LogRocket.init("32jtwe/digitalocean135");</script>
<title>Hello Python</title></head>
<body>
    <h1>Greetings from Alan!</h1>
    <form action="state-python-2.py" method="POST">
        <label>What would you like to save?</label>
        <input type="text" name="user_data" placeholder="enter message">
        <input type="hidden" name="user_ip" value="{user_ip}">
        <input type="hidden" name="generated_at" value="{now}">
        <button type="submit">Submit</button>
    </form>
    <a href="/">Home</a>
</body>
</html>
""")
