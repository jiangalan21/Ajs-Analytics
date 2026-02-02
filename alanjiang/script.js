
async function makeJson(formData, event) {
    event.preventDefault();
    const jsonObject = {};
    for (const [key, value] of formData.entries()) {
        jsonObject[key] = value;
    }
    jsonString = JSON.stringify(jsonObject);

    try {
        const response = await fetch(event.target.action, {
            method: event.target.method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonString
        })
        if (!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.text();
        console.log('Response:', result);
    }   catch (error) {
        console.log('Error:', error);
    }
}

const onSubmit = (event) => {
        if (document.getElementById("javascript-select").value == "off"){
            return;
        }

        event.preventDefault();
        form = document.getElementById("request-form");
        language = document.getElementById("language-select").value;
        verb = document.getElementById("verb-select").value;
        encoding = document.getElementById("encoding-select").value;
        if (language == "perl") {
          if (verb == "GET") {
            form.action = "cgi-bin/perl/perl-get-echo.pl";
          } 
          else if (verb == "POST") {
            form.action = "cgi-bin/perl/perl-post-echo.pl";
          }
          else {
            form.action = "cgi-bin/perl/perl-general-echo.pl";
          }
        } 
        else if (language == "python") {
          form.action = "cgi-bin/python/echo-python.py";
        }
        form.method = verb;
        
        if (encoding == "json") {
          formData = new FormData(form);
          makeJson(formData, event);
        } else {
          form.enctype = "application/x-www-form-urlencoded";
          form.submit();
        }
    }


document.getElementById("request-form").addEventListener("submit", onSubmit);
