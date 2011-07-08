
pjs.addSuite({
    title: 'Basic Scraper Suite',
    url: [
        'http://localhost:8888/test_site/index.html',
        'http://localhost:8888/test_site/page1.html',
        'http://localhost:8888/test_site/page2.html'
    ],
    scrapers: [
        function() {
            return $('h1').first().text();
        }
    ]
});