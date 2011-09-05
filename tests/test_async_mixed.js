
pjs.addSuite({
    url: 'http://localhost:8888/test_site/async.html',
    scrapers: [
        function() {
            return _pjs.getText('#other1');
        },
        {
            async: true,
            scraper: function() {
                $('#clkme').click();
                // now wait for content...
                _pjs.waitForElement('#ajax_content li', function() {
                    _pjs.items = _pjs.getText('#ajax_content li');
                });
            }
        },
        function() {
            return _pjs.getText('#other2');
        }
    ]
});