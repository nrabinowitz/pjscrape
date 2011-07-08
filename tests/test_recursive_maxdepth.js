
var scraper = function() {
    return $('h1').first().text();
};

pjs.addSuite({
    url: 'http://localhost:8888/test_site/index.html',
    moreUrls: function() {
        return _pjs.getAnchorUrls('li a');
    },
    maxDepth: 1,
    scraper: scraper
});