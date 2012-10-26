
pjs.addSuite({
    url: [
        'http://localhost:8888/test_site/index.html',
        'http://localhost:8888/test_site/page1.html',
        'http://localhost:8888/test_site/page2.html'
    ],
    scraper: function() {
        // init or increment counter
        _pjs.state.counter = _pjs.state.counter + 1 || 0;
       
        return "Page " + _pjs.state.counter;
    }
});