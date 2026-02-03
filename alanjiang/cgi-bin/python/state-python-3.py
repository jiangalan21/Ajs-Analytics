#!/usr/bin/python3
import os
from http import cookies

raw_cookie = os.environ.get('HTTP_COOKIE', '')
c = cookies.SimpleCookie()
c.load(raw_cookie)

display_val = c["session_data"].value if "session_data" in c else "No data found."
user_ip = c["user_ip"].value if "user_ip" in c else "No IP found."
generated_at = c["generated_at"].value if "generated_at" in c else "No timestamp found."

print("Content-Type: text/html\n")
print(f"""
<html>
<head>
<!-- Privacy-friendly analytics by Plausible -->
  <script async src="https://plausible.io/js/pa-o5UNLqV-_EUhK3JRizwvm.js"></script>
  <script>
    window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
    plausible.init()
  </script>
<script src="https://cdn.logr-in.com/LogRocket.min.js" crossorigin="anonymous"></script>
  <script>window.LogRocket && window.LogRocket.init("32jtwe/digitalocean135");</script>
<title>Python Session State</title></head>
<body>
    <h1>Session State</h1>
    <p>Stored Data: <b>{display_val}</b></p>
    <p>from IP: <b>{user_ip}</b></p>
    <p>Originally set at: <b>{generated_at}</b></p>
    <hr>
    <a href="state-python-1.py">Set Data</a><br>
    <a href="state-python-4.py">Destroy Data</a>
</body>
</html>
""")