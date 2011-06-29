Overview
--------

**pjscrape** is a framework for anyone who's ever wanted a command-line tool for web scraping using Javascript and [jQuery](http://jquery.com/). Built to run with [PhantomJS](http://phantomjs.org), it allows you to scrape pages in a fully rendered, Javascript-enabled context from the command line, no browser required.

Usage
--------

 1. [Download and install PhantomJS](http://code.google.com/p/phantomjs/downloads/list) or PyPhantomJS, v.1.2. In order to use file-based logging or data writes, you'll need to use PyPhantomJS with the [Save to File plugin](http://dev.umaclan.com/projects/pyphantomjs/wiki/Plugins#Save-to-File) (though I think this feature will be rolled into the PhantomJS core in the next version).
 
 2. Make a config file to define your scraper(s). Config files can set global pjscrape settings via `pjs.config()` and add one or more scraper suites via `pjs.addSuite()`. 
 
 3. A scraper suite defines a set of scraper functions for one or more URLs. More docs on this coming soon, but a sample config file might look like this: 
    
        pjs.addSuite({
            title: 'My Scraper Suite',
            // single URL or array
            urls: [
                'http://www.example.com/page1',
                'http://www.example.com/page2'
            ],
            // one or more functions, evaluated in the client
            scrapers: [
                function() {
                    var items = [];
                    $('h2').each(function() {
                        items.push($(this).text());
                    });
                    return items;
                }
            ]
        });
 
 4. To run pjscrape from the command line, type: `pyphantomjs /path/to/pjscrape.js my_config_file.js`
 
By default, the log output is pretty verbose, and the scraped data is written to stdout at the end of the scrape.

Questions?
----------

Comments and questions welcomed at nick (at) nickrabinowitz (dot) com.
