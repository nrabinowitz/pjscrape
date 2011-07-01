pjs.config({
    log: 'none'
});

var scraper = function() {
    return $('h1').first().text();
};

pjs.addSuite({
    url: 'http://localhost:8888/test_site/index.html',
    scrapers: [scraper]
});
pjs.addSuite({
    url: 'http://localhost:8888/test_site/page1.html',
    scrapers: [scraper]
});

pjs.addSuite({
    url: 'http://localhost:8888/test_site/page2.html',
    scrapers: [scraper]
});