#!/usr/bin/python3

import os
from datetime import datetime


print("Content-Type: text/html")
print()

now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

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
<title>Python Environment Variables</title></head>
<body>
    <h1>Environment Variables</h1>
    <p><b>Language:</b> Python 3</p>
    <p><b>Generated at:</b> {now}</p>
""")
for key, value in os.environ.items():
    print(f"""<p><b>{key}:</b> {value}</p>""")
    
print(f"""
</body>
</html>
""")
