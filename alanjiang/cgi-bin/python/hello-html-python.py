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
<head><!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-RV2EXKKC1Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-RV2EXKKC1Q');
</script>
<script src="https://cdn.logr-in.com/LogRocket.min.js" crossorigin="anonymous"></script>
  <script>window.LogRocket && window.LogRocket.init("32jtwe/digitalocean135");</script>
<title>Hello Python</title></head>
<body>
    <h1>Greetings from Alan!</h1>
    <p><b>Language:</b> Python 3</p>
    <p><b>Generated at:</b> {now}</p>
    <p><b>Your IP Address:</b> {user_ip}</p>
</body>
</html>
""")