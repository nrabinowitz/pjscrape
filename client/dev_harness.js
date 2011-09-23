(function() {

// quick script loader
function _pjs_getScript(url, success){
    var script = document.createElement('script'),
        head = document.getElementsByTagName('head')[0],
        done = false;
    script.src = url;
    script.onload = script.onreadystatechange=function(){
        if(!done&&(!this.readyState||this.readyState=='loaded'||this.readyState=='complete')){
            done = true;
            if (success) { success() }
            script.onload = script.onreadystatechange=null;
            head.removeChild(script);
        }
    };
    head.appendChild(script);
}

// utils copied from core code
function funcify(f) {
    return isFunction(f) ? f : function() { return f };
}
function isArray(a) {
    return Array.isArray(a);
}
function arrify(a) {
    return isArray(a) ? a : a ? [a] : [];
}

_pjs_getScript('http://nrabinowitz.github.com/pjscrape/client/jquery.js', function() {
    window._pjs$ = jQuery.noConflict(true);
    // nesting ensures proper load order
    _pjs_getScript('http://nrabinowitz.github.com/pjscrape/client/pjscrape_client.js', function() {
        
        window.pjs = {
            // limited addSuite support
            addSuite: function(config) {
                // reassign jQuery if necessary
                if (!config.noConflict) {
                    window.$ = window.jQuery = window._pjs$; 
                }
                // prescrape
                if (config.preScrape) config.preScrape();
                // test scrapable
                function scrapable = config.scrapable ? 
                    function() {
                        var test = !!config.scrapable();
                        console.log('scrapable: ' + test);
                        return test;
                    } 
                    : function() { return true };
                if (scrapable()) {
                    // run scraper(s)
                    arrify(config.scraper || config.scrapers)
                        .forEach(function(scraper) {
                            if (isFunction(scraper)) {
                                // standard scraper
                                console.log(scraper());
                            } else if (typeof scraper == 'string') {
                                // selector-only scraper
                                console.log(_pjs.getText(scraper))
                            } else if (scraper.scraper) {
                                // XXX: async not supported yet
                            }
                        });
                }
                // log moreUrls
                if (config.moreUrls) console.log(config.moreUrls());
            }
        }
        
    });
});

})();