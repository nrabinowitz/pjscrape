/**
 * @namespace
 * Namespace for client-side utility functions.
 */
window._pjs = (function($) {
    
    // munge the location
    var loc = window.location,
        base = loc.protocol + '//' + loc.hostname + (loc.port ? ':' + loc.port : ''),
        path = loc.pathname.split('/').slice(0,-1).join('/') + '/';
    
    /**
     * Check whether a URL is local to this site
     * @name _pjs.isLocalUrl
     * @param {String} url      URL to check
     */
    function isLocalUrl(url) {
        return !url.match(/^(https?:\/\/|mailto:)/) || url.indexOf(base) === 0;
    }
    
    /**
     * Convert a local URL to a fully qualified URL (with domain name, etc)
     * @name _pjs.toFullUrl
     * @param {String} url      URL to convert
     */
    function toFullUrl(url) {
        // non-existent, or fully qualified already
        if (!url || url.indexOf(base) === 0 || !isLocalUrl(url)) return url;
        // absolute url
        if (url[0] == '/') return base + url;
        // relative url - browser can figure out ..
        return base + path + url;
    }
    
    /**
     * Convenience function - find all anchor tags on the page matching the given
     * selector (or jQuery object) and return an array of fully qualified URLs
     * @name _pjs.getAnchorUrls
     * @param {String|jQuery} selector      Selector or jQuery object to find anchor elements
     * @param {Boolean} includeOffsite      Whether to include off-site links
     */
    function getAnchorUrls(selector, includeOffsite) {
        return $(selector).map(function() {
            var href = $(this).attr('href');
            return (href && href.indexOf('#') !== 0 && (includeOffsite || isLocalUrl(href))) ? 
                toFullUrl(href) : undefined;
        }).toArray();
    }
    
    /**
     * Convenience function - find all tags on the page matching the given
     * selector (or jQuery object) and return inner text for each
     * @name _pjs.getText
     * @param {String|jQuery} selector      Selector or jQuery object to find elements
     */
    function getText(selector) {
        return $(selector).map(function() {
            return $(this).text();
        }).toArray();
    }
    
    /**
     * Property will be set to true when $(document).ready is called
     * @name _pjs.ready
     * @type {Boolean}
     */
    
    return {
        isLocalUrl: isLocalUrl,
        toFullUrl: toFullUrl,
        getAnchorUrls: getAnchorUrls,
        getText: getText,
        '$': $
    };
}(_pjs$));

// bind to .ready()
_pjs.$(function() {
    _pjs.ready = true;
});

// console.log('Client initialized');