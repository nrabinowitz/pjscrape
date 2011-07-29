
pjs.addSuite({
    url: 'http://localhost:8888/test_site/img_input.html',
    scraper: function() {
        return $('h1').text();
    }
});