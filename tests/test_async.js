
pjs.addSuite({
    url: 'http://localhost:8888/test_site/async.html',
    scraper: {
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
    }
});