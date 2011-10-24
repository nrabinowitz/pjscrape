pjs.addSuite({
    url: 'http://localhost:8888/test_site/patterns.html',
    scrapers: [
        function() {
            return _pjs.getPattern('#set1', 
                ['b', 'text']
            );
        },
        function() {
            return _pjs.getPattern('#set1', 
                {name:'b', text:'text'}
            );
        },
        function() {
            return _pjs.getPattern('#set1', 
                ['b', /special/]
            );
        },
        function() {
            return _pjs.getPattern('#set1', 
                {
                    name:'b', 
                    optional:{pattern:'em', optional:true}, 
                    text:'text'
                }
            );
        },
        function() {
            return _pjs.getPattern('#set1', 
                {
                    name:'b', 
                    optional:{pattern:'em', optional:true, ignore: true}, 
                    text:'text'
                }
            );
        },
        function() {
            return _pjs.getPattern('#set1', 
                {
                    name:'b', 
                    optional:{pattern:'em', optional:true, ignore: true}, 
                    text:'text', 
                    optional2:{pattern:'strong', optional:true}
                }
            );
        },
        function() {
            return _pjs.getPattern('#set1', 
                {
                    name:'b', 
                    text:{pattern:'text', scrape: function(el) { 
                            return $(el).text().trim().slice(-2) 
                        }
                    }
                }
            );
        },
        function() {
            return _pjs.getPattern('#set1', 
                {
                    name:'b', 
                    text:{pattern:'text', test: function(el) { 
                            return $(el).text().indexOf('special') > 0;
                        }
                    }
                }
            );
        },
        function() {
            return _pjs.getPattern('#set1', 
                {
                    name:'b:has(a)',
                    url: {
                        inner: true,
                        scrape: function(el) { return $('a', el).attr('href') }
                    },
                    text:'text'
                }
            );
        }
        
    ]
});