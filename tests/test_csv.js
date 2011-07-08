pjs.config({
    format: 'csv',
    csvFields: ['a', 'b', 'c', 'd', 'e']
});

pjs.addSuite({
    title: 'CSV Scraper Suite',
    url: 'http://localhost:8888/test_site/csv_page.html',
    scrapers: [
        function() {
            return $('tr').map(function() { 
                return [$('td', this).map(function() { 
                    return $(this).text() 
                }).toArray()] 
            }).toArray()
        }
    ]
});