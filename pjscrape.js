/**
 * Scraping harness for PhantomJS. Requires PhantomJS or PyPhantomJS v.1.2
 * with saveToFile() support.
 
 TODO:
 - make pjs.addSuite take either single suite or array
 - make "none" logger
 - make csv writer use JSON.stringify for individual fields;
   consolidate code so that it's always using the array code to write
 - add support for preScrape(page) and postScrape(page) functions in config,
   e.g. to inject variables or scripts into the page (postScrape needed? client or phantom?
   if client, do we need a separate config.injectScript option?)
 - Determine cause of recursive crawl crashes (memory issues?)
 - Some sort of test harness (as a bookmarklet, maybe?) to do client-side scraper dev
   (could call in a file that's hosted on google code, or just do the whole thing in 
   a bookmarklet - not much code I think)
 - add on-the-fly dupe checks? if this is at the suite level, would only work for 
   all-one-type scrapes; at the scraper level, I'd need some way to id the content type
   (either put the scraper in an object, or key the scrapers somehow)
 - Is PjsClient needed anymore? If so, does it need to be available to configs?
 */
 
function fail(msg) {
    console.log('FATAL ERROR: ' + msg);
    phantom.exit();
};

var pjs = (function(){
    var config = {
            timeoutInterval: 300,
            timeoutLimit: 3000,
            log: 'stdout',
            writer: 'stdout',
            format: 'json',
            logFile: 'pjscrape_log.txt',
            outFile: 'pjscrape_out.txt'
        },
        suites = [];
        
        
    // utils
    function isFunction(f) {
        return typeof f === 'function';
    }
    function isArray(a) {
        return Array.isArray(a);
    }
    function extend(obj) {
        Array.prototype.slice.call(arguments, 1).forEach(function(source) {
            for (var prop in source) {
                if (source[prop] !== void 0) obj[prop] = source[prop];
            }
        });
        return obj;
    };

    /**
     * @namespace
     * Logger namespace
     */
    var loggers = {
        // base logger
        base: function() {
            var log = this;
            log.log = function(msg) { console.log(msg) };
            log.msg = function(msg) { log.log('* ' + msg) };
            log.alert = function(msg) { log.log('! ' + msg) };
            log.error = function(msg) { log.log('ERROR: ' + msg) };
        },
        // file loggers
        file: function() {
            var log = new loggers.base();
            log.log = function(msg) { 
                phantom.saveToFile(msg + "\n", config.logFile, 'a');
            };
            return log;
        }
    };
    loggers.stdout = loggers.base;


    /**
     * @namespace
     * Formatter namespace
     */
    var formatters = {
        // json formatter
        json: function() {
            var f = this;
            f.start = '[';
            f.end = ']';
            f.delimiter = ',';
            f.format = function(item) {
                return JSON.stringify(item);
            };
        },
        // csv formatter - takes arrays or objects, requires config.csvFields
        csv: function() {
            var f = this,
                fields = config.csvFields;
            if (!fields || !fields.length) 
                fail('csvFields not defined');
                
            f.delimiter = "\n";
            f.start = fields.join(',') + f.delimiter;
            f.end = '';
            f.format = function(item) {
                if (Array.isArray(item)) {
                    return item
                        .slice(0, fields.length)
                        .concat(item.length < fields.length ? 
                            new Array(fields.length - item.length) :
                            [])
                        .join(',')
                } else if (typeof item == 'object'){
                    var out = [];
                    fields.forEach(function(field) {
                        out.push(item[field] || '');
                    });
                    return out.join(',');
                }
            };
        }
    };

    /**
     * @namespace
     * Writer namespace
     */
    var writers = {
        // base writer
        base: function(log) {
            var w = this,
                count = 0,
                items = [],
                batchSize = config.batchSize,
                format = config.format || 'json',
                firstWrite = true,
                lastWrite = false;
            
            // init formatter
            var formatter = new formatters[format]();
            
            // write output
            var writeBatch = function(batch) {
                log.msg('Writing ' + batch.length + ' items');
                w.write(
                    (firstWrite ? formatter.start : formatter.delimiter) +
                    batch.map(formatter.format).join(formatter.delimiter) +
                    (lastWrite ? formatter.end : '')
                );
                firstWrite = false;
            };
            
            // add one or more items
            w.add = function(i) {
                // add to items
                if (Array.isArray(i)) {
                    items = items.concat(i);
                    count += i.length;
                } else if (i) {
                    items.push(i);
                    count++;
                }
                // write if necessary
                if (batchSize && items.length > batchSize) {
                    writeBatch(items.splice(0, batchSize));
                }
            };
            
            w.finish = function() {
                lastWrite = true;
                writeBatch(items);
            };
            
            w.count = function() {
                return count;
            };
            
            // write to std out
            w.write = function(s) { 
                console.log(s);
            };
        },
        
        // file writer
        file: function(log) {
            var w = new writers.base(log);
            // clear file
            phantom.saveToFile('', config.outFile, 'w');
            // write method
            w.write = function(s) { 
                phantom.saveToFile(s, config.outFile, 'a');
            };
            return w;
        }
    };
    writers.stdout = writers.base;

    var runner = (function() {
        var visited = {},
            log, 
            writer;
        
        // client-side utilities
        var PjsClient = (function() {
            var varName = "window._pjs";
            return {
                varName: varName,
                set: function(page, name, value) {
                    page.evaluate(new Function(varName + "." + name + " = " + JSON.stringify(value)));
                },
                call: function(page, fname, value) {
                    return page.evaluate(new Function(varName + "." + name + "(" + JSON.stringify(value) + ")"));
                },
                injectSelf: function(page) {
                    page.injectJs('client/pjscrape_client.js');
                },
                injectJquery: function(page, noConflict) {
                    page.injectJs('client/jquery.js');
                    if (noConflict) {
                        page.evaluate(function() { 
                            jQuery.noConflict(); 
                        });
                    }
                }
            };
        }());
        
        /**
         * @class
         * Singleton: Manage multiple suites
         */
        var SuiteManager = new function() {
            var mgr = this,
                complete,
                suites = [];
            
            mgr.setComplete = function(cb) {
                complete = cb;
            };
            
            mgr.add = function(suite) {
                suites.push(suite);
            };
            
            mgr.runNext = function() {
                var suite = suites.shift();
                if (suite) suite.run();
                else complete();
            };
        }();
        
        /**
         * @class
         * Scraper suite class - represents a set of urls to scrape
         * @param {String} title        Title for verbose output
         * @param {String[]} urls       Urls to scrape
         * @param {Object} opts         Configuration object
         */
        var ScraperSuite = function(title, urls, opts, complete) {
            var s = this,
                truef = function() { return true };
            // set up options
            s.title = title;
            s.opts = opts;
            s.urls = urls;
            s.opts.ready = s.opts.ready || truef;
            s.opts.scrapable = s.opts.scrapable || truef;
            // set up completion callback
            s.complete = function() {
                log.msg(s.title + " complete");
                SuiteManager.runNext();
            };
            s.depth = 0;
        }
        
        ScraperSuite.prototype = {
            /**
             * Run the suite, scraping each url
             */
            run: function() {
                var s = this,
                    scrapers = s.opts.scrapers,
                    i = 0;
                log.msg(s.title + " starting");
                // set up scraper functions
                var scrapePage = function(page) {
                        if (page.evaluate(s.opts.scrapable)) {
                            // run each scraper
                            if (scrapers && scrapers.length) {
                                scrapers.forEach(function(scraper) {
                                    writer.add(page.evaluate(scraper))
                                });
                            }
                        }
                    },
                    // completion callback
                    complete = function(page) {
                        // recurse if necessary
                        if (s.opts.moreUrls) {
                            // look for more urls on this page
                            var moreUrls = page.evaluate(s.opts.moreUrls);
                            if (moreUrls && (!s.opts.maxDepth || s.depth < s.opts.maxDepth)) {
                                moreUrls.filter(function(url) { return !(url in visited)});
                                if (moreUrls.length) {
                                    log.msg('Found ' + moreUrls.length + ' additional urls to scrape');
                                    // make a new sub-suite
                                    var ss = new ScraperSuite(s.title + '-sub' + i++, moreUrls, s.opts);
                                    ss.depth = s.depth + 1;
                                    SuiteManager.add(ss);
                                }
                            }
                        }
                        runNext();
                    };
                // run each
                var runCounter = 0
                function runNext() {
                    if (runCounter < s.urls.length) {
                        s.scrape(s.urls[runCounter++], scrapePage, complete);
                    } else {
                        s.complete();
                    }
                }
                runNext();
            },
            
            /**
             * Scrape a single page.
             * @param {String} url          Url of page to scrape
             * @param {Function} scraper    Function to scrape page with
             * @param {Function} complete   Callback function to run when complete
             */
            scrape: function(url, scraper, complete) {
                var opts = this.opts,
                    page = new WebPage();
                // set up console output
                page.onConsoleMessage = function(msg) { log.msg('CLIENT: ' + msg) };
                page.onAlert = function(msg) { log.alert('CLIENT: ' + msg) };
                // run the scrape
                page.open(url, function(status) {
                    if (status === "success") {
                        // mark as visited
                        visited[url] = true;
                        log.msg('Scraping ' + url);
                        // load jQuery
                        PjsClient.injectJquery(page, opts.noConflict);
                        // load pjscrape client-side code
                        PjsClient.injectSelf(page);
                        // run scraper
                        if (page.evaluate(opts.ready)) {
                            // run immediately
                            scraper(page);
                            complete(page);
                        } else {
                            // check ready() repeatedly until timeout or success
                            var elapsed = 0,
                                timeoutId = window.setInterval(function() {
                                    if (page.evaluate(opts.ready) || elapsed > config.timeoutLimit) {
                                        scraper(page);
                                        window.clearInterval(timeoutId);
                                        complete(page);
                                    } else {
                                        elapsed += config.timeoutInterval;
                                    }
                                }, config.timeoutInterval);
                        }
                    } else {
                        log.error('Page did not load: ' + url);
                        complete(false);
                    }
                });
            }
        };
        
        function init() {
            // check requirements
            if (!suites.length) fail('No suites configured');
            if (!(config.log in loggers)) fail('Could not find logger: "' + config.log + '"');
            if (!(config.writer in writers)) fail('Could not find writer "' + config.writer + '"');
            
            // init logger
            log = new loggers[config.log]();
            // init writer
            writer = new writers[config.writer](log);
            
            // init suite manager
            SuiteManager.setComplete(function() {
                // scrape complete
                writer.finish();
                log.msg('Saved ' + writer.count() + ' items');
                phantom.exit();
            });
            // make all suites
            suites.forEach(function(suite, i) {
                SuiteManager.add(new ScraperSuite(
                    suite.title || "Suite " + i, 
                    isArray(suite.urls) ? suite.urls : [suite.urls],
                    suite
                ));
            });
            // start the suite manager
            SuiteManager.runNext();
        }
        
        return {
            init: init
        }
    }());

    // expose namespaces and API functions
    return {
        loggers: loggers,
        formatters: formatters,
        writers: writers,
        config: function(key, val) {
            if (typeof key == 'object') {
                extend(config, key);
            } else if (val) {
                config[key] = val;
            }
        },
        addSuite: function(s) { suites.push(s) },
        addSuites: function(s) { suites = suites.concat(s) },
        init: runner.init
    };
}());

 
// make sure we have a config file
if (!phantom.args.length) {
    // die
    console.log('Usage: pjscrape.js <configfile.js>');
    phantom.exit();
} else {
    // load the config file
    if (!phantom.injectJs(phantom.args[0])) {
        fail('Config file not found: ' + phantom.args[0]);
    }
}
// start the scrape
pjs.init();