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

_pjs_getScript('http://nrabinowitz.github.com/pjscrape/client/jquery.js', function() {
    window._pjs$ = jQuery.noConflict(true);
    // nesting ensures proper load order
    _pjs_getScript('http://nrabinowitz.github.com/pjscrape/client/pjscrape_client.js', function() {
        console.log('Pjscrape harness initialized.');
        console.log('(assumes noConflict - use _pjs.$ to access jQuery)');
    });
});

})();