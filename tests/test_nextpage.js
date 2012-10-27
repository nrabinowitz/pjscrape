pjs.addSuite({
    url: 'http://localhost:8888/test_site/nextpage.html',
    scrapers: [
        function() {
            var items = $('h1').text();
            return items;
        }
    ],
    // maxDepth limits number of times the nextPage function will be evaluated
    maxDepth: 1,
    nextPage: function () {
        var next = $('[alt="Next"]');
        if (next.length) {
            next.click();
            return true;
        } else {
            return false;
        }
    }
});