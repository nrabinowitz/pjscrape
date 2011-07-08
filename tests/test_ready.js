
pjs.addSuite({
    url: 'http://localhost:8888/test_site/ready.html',
    ready: function() {
        return $('#ajax_content li').length > 0;
    },
    scraper: function() {
        return _pjs.getText('#ajax_content li');
    }
});