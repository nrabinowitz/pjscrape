
pjs.addSuite({
    url: 'http://localhost:8888/test_site/index.html',
    preScrape: function() {
        window.myVar = "test1";
        _pjs.myVar = "test2";
    },
    scrapers: [
        function() {
            return myVar;
        },
        function() {
            return _pjs.myVar;
        }
    ]
});