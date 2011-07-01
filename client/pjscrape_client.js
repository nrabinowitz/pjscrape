window._pjs = (function() {
    
    function isLocalUrl(url) {
        return !url.match(/^https?:\/\//);
    }
    
    function toFullUrl(url) {
        // fully qualified already
        if (!url || !isLocalUrl(url)) return url;
        var loc = window.location,
            base = loc.protocol + '//' + loc.hostname + (loc.port ? ':' + loc.port : ''),
            path = loc.pathname.split('/').slice(0,-1).join('/') + '/';
        // absolute url
        if (url[0] == '/') return base + url;
        // relative url - browser can figure out ..
        return base + path + url;
    }

    return {
        isLocalUrl: isLocalUrl,
        toFullUrl: toFullUrl
    };
}());