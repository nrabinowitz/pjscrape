pjs.config({
    ignoreDuplicates: true
});

pjs.addSuite({
    url: 'http://localhost:8888/test_site/duplicates.html',
    scrapers: [
        function() {
            return $('li').map(function(i) {
                var $item = $(this);
                return {
                    a: $('span.a', $item).text(),
                    id: $('span.b', $item).text(),
                    i: i // so they won't be identical
                }
            }).toArray();
        }
    ]
});