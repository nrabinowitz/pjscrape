
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
                var i = 0
                _pjs.intervalId = window.setInterval(function() {
                    if ($('#ajax_content li').length) {
                        _pjs.items = _pjs.getText('#ajax_content li');
                        window.clearInterval(_pjs.intervalId);
                    }
                }, 100);
            }
        },
        function() {
            return _pjs.getText('#other2');
        }
    ]
});