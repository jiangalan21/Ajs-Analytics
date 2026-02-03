

 const onSubmit = async (event) => {
    if (document.getElementById("javascript-select").value === "off") {
        return;
    }

    event.preventDefault();

    const form = event.target;
    const language = document.getElementById("language-select").value;
    const verb = document.getElementById("verb-select").value;
    const encoding = document.getElementById("encoding-select").value;
    const formData = new FormData(form);

    if (language == "perl"){
    (encoding === "json") ? 
        form.action = "cgi-bin/perl/perl-general-echo-json.pl" : 
        form.action = "cgi-bin/perl/perl-general-echo.pl";
    } 
    else if (language == "python"){
    (encoding === "json") ? 
        form.action = "cgi-bin/python/echo-python-json.py" : 
        form.action = "cgi-bin/python/echo-python.py";
    }
    else if (language == "php"){
    (encoding === "json") ? 
        form.action = "cgi-bin/php/echo-php-json.php" : 
        form.action = "cgi-bin/php/echo-php.php";
    }
    else if (language == "go"){
    (encoding === "json") ? 
        form.action = "cgi-bin/go/echo-go-json.go" : 
        form.action = "cgi-bin/go/echo-go.go";
    }
    
    if (verb === "GET") {
        form.action += '?' + new URLSearchParams(formData).toString();
    }
    else if (verb === "DELETE" || verb === "PUT") {
        try {
            const response = await fetch(form.action, {
                method: "POST",
                headers: {
                    'X-HTTP-Method-Override': verb,
                },
                body: (encoding === "json") ? JSON.stringify(Object.fromEntries(formData)) : new URLSearchParams(formData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.text();
            document.body.innerHTML = result;
            return;
        }
        catch (error) {
            console.error('Error:', error);
        }
    }
    form.method = verb;

    form.submit();

};

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("request-form").addEventListener("submit", onSubmit);
});
