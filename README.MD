Alan Jiang
I worked on this HW4 by myself.

Grader pass: 135grader
Grader private key: b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZWQyNTUxOQAAACCVaaCNF0dEct7qYfv3DGL6ESWlFyolxNpkCZMs7FNJdwAAAKD9/h/A/f4f
wAAAAAtzc2gtZWQyNTUxOQAAACCVaaCNF0dEct7qYfv3DGL6ESWlFyolxNpkCZMs7FNJdw
AAAEBzHMl3P3kY/10HIiIP4sQ3BcVlRE2fg0WagAFr2TD005VpoI0XR0Ry3uph+/cMYvoR
JaUXKiXE2mQJkyzsU0l3AAAAF2ppYW5nYWxhbkBBSlplbmJvb2sxNFgyAQIDBAUG
No passphrase

1. I created the login page on my reporting site. Submitting the form requests the API on the reporting domain, reverse proxy setup Apache routes the request to my api.js file Node.js instance which is a constantly run process on the server using PM2. This triggers the login endpoint, querying my PostgreSQL database, and verifying auth details. Node gets the output, sets a cookie for the client upon sucess, and then the browser gets sent to a dashboard page.

2. Upon reaching the dashboard page, the page automatically fires another request to Node instance to query database for performance data. The data gets returned as a JSON object and then populates an HTML table to display the raw formatted data.

3. Importing ZingChart script, I took the raw inputted data and funneled it into basic bar charts to display the average load and ttfb times in ms for two different pages.

URL
https://www.reporting.alanjiang.site

Auth
username: admin
password: password


