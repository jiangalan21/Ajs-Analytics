(function() {
    'use strict';

    const endpoint = "https://www.collector.alanjiang.site/collect"

    function sendBeacon(){

        const payload = {
            url: window.location.href,
            title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            type: "pageview",
        }

        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        

        if (navigator.sendBeacon) {
            const sent = navigator.sendBeacon(endpoint, blob);
            if (sent) return;
        } 

        fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
                keepalive: true
        }).catch((err) => {
            fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }).catch(() => {});
        });
    }

    if (document.readyState === "complete") {
        sendBeacon();
    } else {
        window.addEventListener("load", sendBeacon);
    }

})();