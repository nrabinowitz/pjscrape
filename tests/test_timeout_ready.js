
pjs.addSuite({
    url: 'http://localhost:8888/test_site/index.html',
    ready: function() {
        return $('#doesnotexist').length > 0;
    },
    scraper: function() {
        return _pjs.getText('li a');
    }
});