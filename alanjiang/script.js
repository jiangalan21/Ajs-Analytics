

 const onSubmit = (event) => {
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
        if (encoding === "json"){
            form.action = "cgi-bin/perl/perl-general-echo-json.pl";
        }
        else {
            form.action = "cgi-bin/perl/perl-general-echo.pl";
        }
    } 
    else if (language == "python"){
        if (encoding === "json"){
            form.action = "cgi-bin/python/echo-python-json.py";
        }
        else {
            form.action = "cgi-bin/python/echo-python.py";
        }
    }

    
    if (verb === "GET") {
        form.action += '?' + new URLSearchParams(formData).toString();
    }

    form.method = verb;

    form.submit();

};

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("request-form").addEventListener("submit", onSubmit);
});
