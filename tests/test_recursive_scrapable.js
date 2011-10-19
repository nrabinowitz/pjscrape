
var scraper = function() {
    return $('h1').first().text();
};

pjs.addSuite({
    url: 'http://localhost:8888/test_site/index.html',
    moreUrls: function() {
        return _pjs.getAnchorUrls('li a');
    },
    scrapable: function() {
        var h1 = $('h1').first().text();
        return h1.indexOf('Page 2') > 0 || h1.indexOf('Page 4') > 0;
    },
    scraper: scraper
});