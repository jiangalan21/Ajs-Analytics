(function() {
    'use strict';

    const endpoint = "https://www.collector.alanjiang.site/collect"

    function round(n) {
        return Math.round(n * 100) / 100;
    }

    function getSessionId() {
        let sid = sessionStorage.getItem('_collector_sid');
        if (!sid) {
            sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
            sessionStorage.setItem('_collector_sid', sid);
        }
        return sid;
    }

    function getStatic() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            cookiesEnabled: navigator.cookieEnabled,
            jsEnabled: true,
            cssEnabled: (() => {
                const testDiv = document.createElement('div');
                testDiv.id = 'css-test';
                testDiv.style.display = 'none';
                document.body.appendChild(testDiv);
                const isSet = window.getComputedStyle(testDiv).height === '10px';
                document.body.removeChild(testDiv);
                return isSet;
            })(),
            imagesEnabled: (() => {
                const img = new Image();
                img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                return img.complete && img.naturalWidth > 0;
            })(),
            screen: {
                width: window.screen.width,
                height: window.screen.height,
            },
            window: {
                width: window.innerWidth,
                height: window.innerHeight,
            },
            connection: ('connection' in navigator) ? {
                effectiveType: navigator.connection.effectiveType,
            } : 'unknown',
        }
    }

    function getPerformance() {
        const navEntry = performance.getEntriesByType('navigation')[0];
        if (!navEntry) return {'error': 'Nav'};

        return {
            // DNS lookup time
            dnsLookup: round(navEntry.domainLookupEnd - navEntry.domainLookupStart),
            // TCP connection time
            tcpConnect: round(navEntry.connectEnd - navEntry.connectStart),
            // TLS handshake (HTTPS only)
                tlsHandshake: navEntry.secureConnectionStart > 0
                ? round(navEntry.connectEnd - navEntry.secureConnectionStart) : 0,
            // Time to First Byte
            ttfb: round(navEntry.responseStart - navEntry.requestStart),
            // Download time (response)
            download: round(navEntry.responseEnd - navEntry.responseStart),
            // DOM interactive (HTML parsed, not all resources loaded)
            domInteractive: round(navEntry.domInteractive - navEntry.fetchStart),
            // DOM complete (all resources loaded)
            domComplete: round(navEntry.domComplete - navEntry.fetchStart),
            // Total fetch time
            fetchTime: round(navEntry.responseEnd - navEntry.fetchStart),
            // Transfer size and header overhead
            transferSize: navEntry.transferSize,
            headerSize: navEntry.transferSize - navEntry.encodedBodySize,
            //load event time
            loadStart: navEntry.fetchStart,
            loadEnd: navEntry.loadEventEnd,
            total: round(navEntry.loadEventEnd - navEntry.fetchStart)
        }
    }
    function sendBeacon(){
        const perfData = getPerformance();

        const payload = {
            url: window.location.href,
            session: getSessionId(),
            title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            type: "static_pageview",
            static: getStatic(),
            performance: (perfData && perfData.total > 0) ? perfData : "unavailable"

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
        setTimeout(() => {
            sendBeacon();
        }, 0);
    } else {
        window.addEventListener("load", () => {
            setTimeout(() => {
                sendBeacon();
            }, 0);
        });
    }

})();