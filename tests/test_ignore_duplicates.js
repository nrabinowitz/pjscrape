pjs.config({
    ignoreDuplicates: true
});

pjs.addSuite({
    url: 'http://localhost:8888/test_site/duplicates.html',
    scrapers: [
        function() {
            return $('li').map(function() {
                var $item = $(this);
                return {
                    a: $('span.a', $item).text(),
                    b: $('span.b', $item).text()
                }
            }).toArray();
        }
    ]
});