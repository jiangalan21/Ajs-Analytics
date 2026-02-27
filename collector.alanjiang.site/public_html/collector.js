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
    
    function initErrorTracking() {
        
        window.addEventListener('error', (event) => {
            if (event instanceof ErrorEvent) {
                // JavaScript runtime error
                reportError({
                    type: 'js-error',
                    message: event.message,
                    source: event.filename,
                    line: event.lineno,
                    column: event.colno,
                    stack: event.error ? event.error.stack : '',
                    url: window.location.href
                });
            } else {
                // Resource load failure (IMG, SCRIPT, LINK)
                const target = event.target;
                if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
                    reportError({
                        type: 'resource-error',
                        tagName: target.tagName,
                        src: target.src || target.href || '',
                        url: window.location.href
                    });
                }
            }
            }, true); // capture phase required for resource errors

            // Unhandled promise rejections
            window.addEventListener('unhandledrejection', (event) => {
            const reason = event.reason;
            reportError({
                type: 'promise-rejection',
                message: reason instanceof Error ? reason.message : String(reason),
                stack: reason instanceof Error ? reason.stack : '',
                url: window.location.href
            });
        });

        console.log('Error tracking initialized');
    }

    const reportedErrors = new Set();
    const MAX_ERRORS = 10;
    let errorCount = 0;

    function reportError(errorData) {
        // Rate limit: max errors per page load
        if (errorCount >= MAX_ERRORS) {
            console.log(`Error rate limit reached (${MAX_ERRORS}), ignoring:`, errorData.message);
            return;
        }

        // Deduplicate by type + message + source + line
        const key = `${errorData.type}:${errorData.message || ''}:${errorData.source || ''}:${errorData.line || ''}`;
        if (reportedErrors.has(key)) {
            console.log('Duplicate error suppressed:', errorData.message);
            return;
        }
        reportedErrors.add(key);
        errorCount++;

        console.log(`Error #${errorCount}:`, errorData.type, '-', errorData.message);

        // Send error beacon
        const payload = {
            type: 'error',
            error: errorData,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            session: getSessionId()
        };

        sendBeacon(payload);

        // Dispatch custom event so test pages can display the error
        window.dispatchEvent(new CustomEvent('collector:error', { detail: { errorData: errorData, count: errorCount } }));
    }

    function collect() {
    
        const perfData = getPerformance();

        const payload = {
            url: window.location.href,
            session: getSessionId(),
            title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            type: "static_pageview",
            static: getStatic(),
            performance: (perfData && perfData.total > 0) ? perfData : "unavailable",
            activity: "non",
        }

        sendBeacon(payload);
    }

    function sendBeacon(payload){
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

     initErrorTracking();

    if (document.readyState === "complete") {
        setTimeout(() => {
            collect();
            initKeyTracker();
        }, 0);
    } else {
        window.addEventListener("load", () => {
            setTimeout(() => {
                collect();
                initKeyTracker();
            }, 0);
        });
    }

    function initKeyTracker() {
        document.querySelector('input').addEventListener('keydown', (e) => {
            const payload = {
                key: e.key,
            }
            sendBeacon(payload);
        })
    }

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            //sum
        }
    });

})();