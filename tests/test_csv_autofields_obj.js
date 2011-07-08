pjs.config({
    format: 'csv'
});

pjs.addSuite({
    title: 'CSV Scraper Suite',
    url: 'http://localhost:8888/test_site/csv_page.html',
    scrapers: [
        function() {
            return $('tr').map(function() { 
                var vals = $('td', this).map(function() { 
                        return $(this).text() 
                    }).toArray(),
                    keys = ['a','b','c','d','e'],
                    o = {};
                keys.forEach(function(k, i) {
                    o[k] = vals[i];
                });
                return o;
            }).toArray()
        }
    ]
});