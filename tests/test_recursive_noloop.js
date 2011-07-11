
var scraper = function() {
    return $('h1').first().text();
};

pjs.addSuite({
    url: 'http://localhost:8888/test_site/loop1.html',
    moreUrls: function() {
        return _pjs.getAnchorUrls('li a');
    },
    maxDepth: 4,
    scraper: scraper
});