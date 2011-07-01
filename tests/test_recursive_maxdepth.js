pjs.config({
    log: 'none'
});

var scraper = function() {
    return $('h1').first().text();
};

pjs.addSuite({
    url: 'http://localhost:8888/test_site/index.html',
    moreUrls: function() {
        return $('li a').map(function() {
            return window._pjs.toFullUrl($(this).attr('href'));
        }).toArray();
    },
    maxDepth: 1,
    scrapers: [scraper]
});