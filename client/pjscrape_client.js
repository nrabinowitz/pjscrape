/**
 * @overview
 * Client-side helpers for pjscrape
 * @name pjscrape_client.js
 */

/**
 * @namespace
 * Namespace for client-side utility functions. This will be available
 * to scrapers as <code>_pjs</code> or <code>window._pjs</code>.
 * @name _pjs
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
     * @return {Boolean}        Whether this URL is local
     */
    function isLocalUrl(url) {
        return !url.match(/^(https?:\/\/|mailto:)/) || url.indexOf(base) === 0;
    }
    
    /**
     * Convert a local URL to a fully qualified URL (with domain name, etc)
     * @name _pjs.toFullUrl
     * @param {String} url      URL to convert
     * @return {String}         Fully qualified URL
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
     * @return {String[]}                   Array of fully qualified URLs
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
     * @return {String[]}                   Array of text contents
     */
    function getText(selector) {
        return $(selector).map(function() {
            return $(this).text();
        }).toArray();
    }
    
    /**
     * Flag that will be set to true when $(document).ready is called. 
     * Generally your code will not need to deal with this - use the "ready"
     * configuration parameter instead.
     * @type Boolean
     * @name _pjs.ready
     */
    
    return {
        isLocalUrl: isLocalUrl,
        toFullUrl: toFullUrl,
        getAnchorUrls: getAnchorUrls,
        getText: getText,
        /**
         * Reference to jQuery. This is guaranteed to be
         * the pjscrape.js version of the jQuery library.
         * Scrapers using the 'noConflict' config option 
         * should use this reference in their code.
         * @type jQuery
         * @name _pjs.$
         */
        '$': $
    };
}(_pjs$));

// bind to .ready()
window._pjs.$(function() {
    window._pjs.ready = true;
});

// for reasons I can't fathom, omitting this line throws an
// error on pages with <input type="image">. Go figure.
console.log('Client-side code initialized');