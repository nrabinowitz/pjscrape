pjs.config({
    preScrape: function() {
        window.myVar = "in_config";
    },
    scraper: function() {
        return myVar;
    },
    allowRepeatUrls: true
});

pjs.addSuite({
    url: 'http://localhost:8888/test_site/index.html'
});

pjs.addSuite({
    url: 'http://localhost:8888/test_site/index.html',
    preScrape: function() {
        window.myVar = "in_suite";
    }
});

pjs.addSuite({
    url: 'http://localhost:8888/test_site/index.html',
    scraper: function() {
       return "in_scraper";
    }
});