(async function() {
    'use strict';

    const endpoint = "https://www.collector.alanjiang.site/collect"

    let config = {
        endpoint: endpoint,
    };
    let initialized = false;
    const properties = {};
    let userId = null;
    const extensions = {};
    const queue = [];

    const SESSION_ID = (() => {
        let sid = sessionStorage.getItem('_collector_sid');
        if (!sid) {
            sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
        }
        sessionStorage.setItem('_collector_sid', sid);
        set('sessionId', sid);
        return sid;
    })();

    const { onLCP, onCLS, onINP, onFCP } = await import('https://unpkg.com/web-vitals@4.0.1/dist/web-vitals.attribution.js?module');

    onLCP(metric => sendVital('lcp', metric.value));
    onCLS(metric => sendVital('cls', metric.value));
    onINP(metric => sendVital('inp', metric.value));
    onFCP(metric => sendVital('fcp', metric.value));

    function sendVital(name, value) {
        if (!initialized) { 
            // defer until after init
            queue.push(() => sendVital(name, value));
            return;
        }
        track('vital', {
            sessionId: getSessionId(),   // same session ID from your existing script
            name: name,
            value: value
        });
    }

    function log(...args) {
        if (config.debug) {
            console.log('[Collector]', ...args);
        }
    }

    function warn(...args) {
        console.warn('[Collector]', ...args);
    }

    function round(n) {
        return Math.round(n * 100) / 100;
    }

    function merge(target, source) {
    for (const key of Object.keys(source)) {
      target[key] = source[key];
    }
    return target;
  }

    function getSessionId() {
        return SESSION_ID;
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

        let errorCount = 0;
        const reportedErrors = new Set();

        window.onerror = function(message, source, lineno, colno, error) {

            const key = `${error.type}:${error.message}:${error.source || ''}:${error.line || ''}`;
            if (reportedErrors.has(key)) return;
            reportedErrors.add(key);
            errorCount++;

            track('error', {
                message: message,
                source: source,
                lineno: lineno,
                colno: colno,
                stack: error && error.stack ? error.stack.substring(0, 1000) : ''
            });
        };

        window.addEventListener('unhandledrejection', (event) => {
            track('unhandled_rejection', {
                reason: String(event.reason).substring(0, 500)
            });
        });

        console.log('Error tracking initialized');
    }

    function init(options) {
        if (initialized) {
            warn('collector.init() called more than once');
            return;
        }

        if (options) {
            // Merge user options with defaults
            merge(config, options);
        }
        initialized = true;

        initKeyTracker();

        initActivityTracker();

        initErrorTracking();
        log('Initialized with config:', config);


        if (document.readyState === "complete") {
            setTimeout(() => {
                collect();
            }, 0);
        } else {
            window.addEventListener("load", () => {
                setTimeout(() => {
                    collect();
                }, 0);
            });
        }
        queue.forEach(fn => fn());
        queue.length = 0;
    }

    function track(eventType, data) {
        if (!initialized) {
            warn('collector.track() called before init()');
            return;
        }
        const payload = {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            type: eventType,
            data: data || {}
        };

        merge(payload, properties);

        if (userId) {
            payload.userId = userId;
        }

        if (config.app) {
            payload.app = config.app;
        }

        sendBeacon(payload);
    }

    function set(key, value) {
        if (typeof key === 'object') {
            merge(properties, key);
        } else {
            properties[key] = value;
        }
        log('Global property set:', key, '=', value);
    }

    function identify(id) {
        userId = id;
        log('User identified:', id);
    }

    // document.addEventListener('visibilitychange', () => {
    //     if (document.visibilityState === 'hidden') {
    //         //sum
    //     }
    // });

    function initKeyTracker() {
        let timeout = null;
        const payload = {
            key_string: ""
        };

        window.addEventListener('keydown', (e) => {
            if (e.key.length > 1 && e.key !== "Backspace") return;
            payload.key_string += e.key;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (payload.key_string.length > 0) {
                    track("typing", payload);
                    payload.key_string = "";
                }
            }, 1000);
        })

    }

    function initActivityTracker() {
        let lastActivity = Date.now();
        const entryTime = Date.now();

        // 1. Record Page Entry
        track("page_entry");

        const recordActivity = () => {
            const now = Date.now();
            const idleDuration = now - lastActivity;

            // 2. Detect Idle Break (2 or more seconds)
            if (idleDuration >= 2000) {
                track("idle_break", {
                    breakEndedAt: new Date(now).toISOString(),
                    durationMs: idleDuration,
                    message: "User was inactive"
                });
            }

            lastActivity = now;
        };

        // Listen for common "active" signals
        const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        activityEvents.forEach(event => {
            window.addEventListener(event, recordActivity, { passive: true });
        });

        // 3. Record Page Exit
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                track("page_exit");
            }
        });
    }

    function use(extension) {
        if (!extension || !extension.name) {
            warn('Extension must have a name property');
            return;
        }
        if (extensions[extension.name]) {
            warn(`Extension "${extension.name}" already registered`);
            return;
        }

        extensions[extension.name] = extension;

        // Call init, passing the collector's limited public API
        if (typeof extension.init === 'function') {
            extension.init({
                track: track,
                set: set,
                getConfig: () => config,
                getSessionId: getSessionId
            });
        }

        log('Extension registered:', extension.name);
    }

    
    function collect() {
    
        const perfData = getPerformance();

        const payload = {
            url: window.location.href,
            title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            type: "prefire",
            static: getStatic(),
            performance: (perfData && perfData.total > 0) ? perfData : "unavailable",
        }

        merge(payload, properties);

        if (userId) {
            payload.userId = userId;
        }

        if (config.app) {
            payload.app = config.app;
        }

        sendBeacon(payload);
    }

    function sendBeacon(payload){
        /** CHALLENGE POINT:
         * Put the sessionId into the query string to be associated in logs
        */
        const url = `${config.endpoint}?_csid=${sessionStorage.getItem('_collector_sid')}`;
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });       

        if (navigator.sendBeacon) {
            const sent = navigator.sendBeacon(url, blob);
            if (sent) {
                log('Beacon sent via sendBeacon');
                return;
            }
        }
        warn('send beacon failed, trying fetch:', err.message);
        fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
                keepalive: true
        }).catch((err) => {
            warn('fetch failed, trying basic fetch:', err.message);
        }).then(() => {
            fetch (url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
        }).catch((err) => {
            warn(' fallback fetch:', err.message);
        });
    
        log('payload:', payload);
    }

    window.collector = {
        init: init,
        track: track,
        set: set,
        identify: identify,
        use: use,
    };

})();