pjs.addSuite({
    urls: [
        'http://non_existent/',
        'http://localhost:8888/test_site/not-a-real-page.html',
        'http://localhost:8888/test_site/index.html'
    ],
    scraper: 'h1'
});