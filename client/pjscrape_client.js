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
        // absolute url beginning with // (same protocol as the current location)
        if (url.indexOf('//') === 0) return loc.protocol + url;
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
     * Get a set of records by looking for repeated patterns in the .content()
     * of the selected element. Patterns can be supplied as either objects or
     * arrays; the record format will match the input format. Pattern pieces
     * can be either selector strings, regular expressions, or "text" for
     * unwrapped text blocks. Interstitial cruft (br tags, line breaks, etc)
     * will be ignored if they don't have any text other than whitespace.
     * Pattern pieces can also be specified as objects, in the format
     * <code>{pattern: [pattern piece], ...options}</code>, in order to specify 
     * additional options. Available options are <code>optional</code> (boolean), 
     * <code>ignore</code> (boolean, require but don't return content),
     * <code>inner</code> (boolean, scrape again in the previous element),
     * <code>scrape</code> (custom function to scrape content from matched element), 
     * and <code>test</code> (custom function to test if element matches).
     * @name _pjs.getPattern
     * @param {String|jQuery} selector      Selector or jQuery object to find elements
     * @param {Object|Array} pattern        Pattern to look for
     * @return {Object[]|Array[]}           Records in format matching the pattern format
     */
    function getPattern(selector, pattern) {
        var isArray = Array.isArray(pattern),
            pieces = isArray ? pattern :  [],
            testBlank = function(el) {
                return (/^\s*$/).test($(el).text())
            },
            output = [],
            contents = $(selector).contents().toArray(),
            prevPattern;
        // quick fail
        if (!contents.length) return [];
        // set up pattern pieces
        function makePiece(piece, key) {
            if (typeof piece == 'object' && !(piece instanceof RegExp)) {
                piece.key = key;
                // inner pieces still need a pattern to match the current element
                if (piece.inner) {
                    piece.pattern = prevPattern;
                }
            } else {
                piece = {
                    key: key,
                    pattern: piece
                }
            }
            // save for inner if necessary
            prevPattern = piece.pattern;
            // set scrape function, if not supplied
            piece.scrape = piece.scrape || function(el) {
                return $(el).text().trim()
            }
            // set test function
            piece.test = piece.test || function(el) {
                return piece.pattern == "text" ? // text node
                        el.nodeType == Node.TEXT_NODE && !testBlank(el) :
                    typeof piece.pattern == "string" ? // selector
                        $(el).is(piece.pattern) :
                    piece.pattern instanceof RegExp ? // regexp
                        piece.pattern.test($(el).text()) : false;
            }
            return piece;
        }
        // convert object to array
        if (!isArray) {
            for (var key in pattern) {
                pieces.push(makePiece(pattern[key], key))
            }
        } else {
            // convert array to desired format
            pieces = pieces.map(makePiece);
        }
        // quick exit #2
        if (!pieces.length) return;
        // create a state automaton
        var state, collector;
        function reset() {
            state = 0,
            collector = isArray ? [] : {};
        }
        // save and reset if necessary
        function checkReset() {
            if (state >= pieces.length) {
                output.push(collector);
                reset();
            }
        }
        function step(el) {
            if (testBlank(el)) return;
            checkReset(); // check at the beginning for trailing optional
            var piece = pieces[state];
            // check for match
            if (piece.test(el)) {
                // hit; scrape
                if (!piece.ignore) {
                    collector[piece.key] = piece.scrape(el);
                }
                state++;
                // lookahead for inner patterns
                if (pieces[state] && pieces[state].inner) {
                    step(el);
                }
            } else if (piece.optional) {
                // optional; advance
                state++;
                step(el);
            } else if (state > 0) reset(); // miss; reset
            checkReset();
        }
        // iterate through the contents
        reset();
        contents.forEach(step);
        
        return output;
    }
    
    /**
     * Wait for a condition to occur, then execute the callback
     * @name _pjs.waitFor
     * @param {Function} test       Test function; should return true when ready
     * @param {Function} callback   Callback function to execute
     */
    function waitFor(test, callback) {
        var intervalId = window.setInterval(function() {
            if (test()) {
                window.clearInterval(intervalId);
                callback();
            }
        }, 100);
    }
    
    /**
     * Wait for an element to appear, then execute the callback
     * @name _pjs.waitForElement
     * @param {String} selector     JQuery selector to look for
     * @param {Function} callback   Callback function to execute
     */
    function waitForElement(selector, callback) {
        waitFor(function() {
            return !!$(selector).length;
        }, callback);
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
        getPattern: getPattern,
        waitFor: waitFor,
        waitForElement: waitForElement,
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
console.log('___ Client-side code initialized');
