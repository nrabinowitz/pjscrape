pjs.config({
    allowRepeatUrls: true
});

pjs.addSuite({
    url: 'http://localhost:8888/test_site/jquery_versions.html',
    scraper: function() {
        return [$().jquery, _pjs.$().jquery];
    }
});

pjs.addSuite({
    noConflict: true,
    url: 'http://localhost:8888/test_site/jquery_versions.html',
    scraper: function() {
        return [$().jquery, _pjs.$().jquery];
    }
});