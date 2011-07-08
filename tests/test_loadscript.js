
pjs.addSuite({
    url: 'http://localhost:8888/test_site/index.html',
    loadScript: "data.js",
    scrapers: [
        function() {
            return myVar;
        },
        function() {
            return _pjs.myVar;
        }
    ]
});