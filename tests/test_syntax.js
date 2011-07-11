pjs.config({
    allowRepeatUrls: true
});

pjs.addSuite({
    url: 'http://localhost:8888/test_site/index.html',
    scraper: function() {
        return $('h1').first().text();
    }
});

pjs.addSuite({
    urls: 'http://localhost:8888/test_site/index.html',
    scrapers: function() {
        return $('li a').first().text();
    }
});

pjs.addSuite(
    {
        url: 'http://localhost:8888/test_site/index.html',
        scraper: function() {
            return $('h1').first().text();
        }
    },
    {
        urls: 'http://localhost:8888/test_site/index.html',
        scrapers: function() {
            return $('li').first().text();
        }
    }
);

pjs.addScraper(
    'http://localhost:8888/test_site/index.html',
    function() {
        return $('li a').last().text();
    }
);