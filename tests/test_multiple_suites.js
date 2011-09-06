
var scraper = function() {
    return $('h1').first().text();
};

pjs.addSuite({
    url: 'http://localhost:8888/test_site/index.html',
    scraper: scraper
});

pjs.addSuite({
    url: 'http://localhost:8888/test_site/page1.html',
    scraper: scraper
});

pjs.addSuite({
    url: 'http://localhost:8888/test_site/page2.html',
    scraper: scraper
});