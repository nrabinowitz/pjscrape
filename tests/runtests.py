import SimpleHTTPServer
import SocketServer
import threading
import unittest
import subprocess
import os

PORT = 8888
COMMAND_BASE = ["phantomjs", os.path.join('..', 'pjscrape.js'), 'base_config.js']
OUT_FILE = 'C:\Temp\pjscrape_out.txt'

def getPjscrapeOutput(*script_name):
    return subprocess.check_output(COMMAND_BASE + list(script_name)).strip()

class QuietHTTPRequestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass
        

class TestPjscrape(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # set up server
        cls.httpd = SocketServer.TCPServer(("", PORT), QuietHTTPRequestHandler)
        httpd_thread = threading.Thread(target=cls.httpd.serve_forever)
        httpd_thread.setDaemon(True)
        httpd_thread.start()
    
    @classmethod
    def tearDownClass(cls):
        # tear down server
        cls.httpd.shutdown()
        
    def test_basic(self):
        out = getPjscrapeOutput('test_basic.js')
        self.assertEqual(out, '["Test Page: Index","Page 1","Page 2"]')
            
    def test_multiple_urls(self):
        out = getPjscrapeOutput('test_multiple_urls.js')
        self.assertEqual(out, '["Test Page: Index","Test Page: Page 1","Test Page: Page 2"]')
            
    def test_multiple_suites(self):
        out = getPjscrapeOutput('test_multiple_suites.js')
        self.assertEqual(out, '["Test Page: Index","Test Page: Page 1","Test Page: Page 2"]')
            
    def test_multiple_files(self):
        out = getPjscrapeOutput('test_basic.js', 'test_multiple_suites.js')
        self.assertEqual(out, '["Test Page: Index","Page 1","Page 2","Test Page: Page 1","Test Page: Page 2"]')
            
    def test_recursive_maxdepth(self):
        out = getPjscrapeOutput('test_recursive_maxdepth.js')
        self.assertEqual(out, '["Test Page: Index","Test Page: Page 1","Test Page: Page 2"]')
            
    def test_recursive_nomaxdepth(self):
        out = getPjscrapeOutput('test_recursive_nomaxdepth.js')
        self.assertEqual(out, '["Test Page: Index","Test Page: Page 1","Test Page: Page 2","Test Page: Page 3","Test Page: Page 4"]')
            
    def test_recursive_scrapable(self):
        out = getPjscrapeOutput('test_recursive_scrapable.js')
        self.assertEqual(out, '["Test Page: Page 2","Test Page: Page 4"]')
            
    def test_recursive_selector(self):
        out = getPjscrapeOutput('test_recursive_selector.js')
        self.assertEqual(out, '["Test Page: Index","Test Page: Page 1","Test Page: Page 2","Test Page: Page 3","Test Page: Page 4"]')
            
    def test_recursive_noloop(self):
        out = getPjscrapeOutput('test_recursive_noloop.js')
        self.assertEqual(out, '["Test Page: Loop 1","Test Page: Loop 2"]')
            
    def test_recursive_allowrepeat(self):
        out = getPjscrapeOutput('test_recursive_allowrepeat.js')
        self.assertEqual(out, '["Test Page: Loop 1","Test Page: Loop 2","Test Page: Loop 1","Test Page: Loop 2","Test Page: Loop 1"]')
            
    def test_csv(self):
        out = getPjscrapeOutput('test_csv.js')
        # not sure why stdout uses \r\r\n, but that seems to be the case
        self.assertEqual(out, '"a","b","c","d","e"\r\r\n"1","string","string\'s","a ""quoted"" string","111"\r\r\n"2","string","string\'s","a ""quoted"" string","222"\r\r\n"3","string","string\'s","a ""quoted"" string","333"')
            
    def test_csv_autofields(self):
        out = getPjscrapeOutput('test_csv_autofields.js')
        self.assertEqual(out, '"Column 1","Column 2","Column 3","Column 4","Column 5"\r\r\n"1","string","string\'s","a ""quoted"" string","111"\r\r\n"2","string","string\'s","a ""quoted"" string","222"\r\r\n"3","string","string\'s","a ""quoted"" string","333"')
            
    def test_csv_autofields_obj(self):
        out = getPjscrapeOutput('test_csv_autofields_obj.js')
        self.assertEqual(out, '"a","b","c","d","e"\r\r\n"1","string","string\'s","a ""quoted"" string","111"\r\r\n"2","string","string\'s","a ""quoted"" string","222"\r\r\n"3","string","string\'s","a ""quoted"" string","333"')
            
    def test_prescrape(self):
        out = getPjscrapeOutput('test_prescrape.js')
        self.assertEqual(out, '["test1","test2"]')
            
    def test_loadscript(self):
        out = getPjscrapeOutput('test_loadscript.js')
        self.assertEqual(out, '["test1","test2"]')
            
    def test_syntax(self):
        out = getPjscrapeOutput('test_syntax.js')
        self.assertEqual(out, '["Test Page: Index","Page 1","Test Page: Index","Page 1","Page 2"]')
            
    def test_config_cascade(self):
        out = getPjscrapeOutput('test_config_cascade.js')
        self.assertEqual(out, '["in_config","in_suite","in_scraper"]')
        
    def test_selector_scraper(self):
        out = getPjscrapeOutput('test_selector_scraper.js')
        self.assertEqual(out, '["Test Page: Index","Page 1","Page 2"]')
            
    def test_ready(self):
        out = getPjscrapeOutput('test_ready.js')
        self.assertEqual(out, '["Content 1","Content 2"]')
            
    def test_async(self):
        out = getPjscrapeOutput('test_async.js')
        self.assertEqual(out, '["Content 1","Content 2"]')
            
    def test_async_mixed(self):
        out = getPjscrapeOutput('test_async_mixed.js')
        self.assertEqual(out, '["Other Content 1","Other Content 2","Content 1","Content 2"]')
            
    def test_jquery_versions(self):
        out = getPjscrapeOutput('test_jquery_versions.js')
        self.assertEqual(out, '["1.6.1","1.6.1","1.4.1","1.6.1"]')
            
    def test_ignore_duplicates(self):
        out = getPjscrapeOutput('test_ignore_duplicates.js')
        self.assertEqual(out, '[{"a":"test","b":"1"},{"a":"test","b":"2"}]')
            
    def test_ignore_duplicates_id(self):
        out = getPjscrapeOutput('test_ignore_duplicates_id.js')
        # keys in alphabetical order due to http://code.google.com/p/phantomjs/issues/detail?id=170
        self.assertEqual(out, '[{"a":"test","i":0,"id":"1"},{"a":"test","i":1,"id":"2"}]')
            
    def test_img_input(self):
        out = getPjscrapeOutput('test_img_input.js')
        self.assertEqual(out, '["Test Page: Weird Image Input Issue"]')
        
    def test_timeout_ready(self):
        out = getPjscrapeOutput('test_timeout_ready.js')
        self.assertEqual(out, '["Page 1","Page 2"]')
        
    def test_timeout_async(self):
        out = getPjscrapeOutput('test_timeout_async.js')
        self.assertEqual(out, '[]')
        
    def test_404_handling(self):
        out = getPjscrapeOutput('test_404_handling.js')
        self.assertEqual(out, '["Test Page: Index"]')
        
    def test_getpattern(self):
        # XXX - I should probably break this up into different tests....
        out = getPjscrapeOutput('test_getpattern.js')
        self.assertEqual(out, '[["Item 1","Some text 1."],["Item 2","Some special text 2."],{"name":"Item 1","text":"Some text 1."},{"name":"Item 2","text":"Some special text 2."},["Item 2","Some special text 2."],{"name":"Item 1","text":"Some text 1."},{"name":"Item 2","text":"Some special text 2."},{"name":"Item 3","optional":"optional text","text":"Some text 3."},{"name":"Item 1","text":"Some text 1."},{"name":"Item 2","text":"Some special text 2."},{"name":"Item 3","text":"Some text 3."},{"name":"Item 1","text":"Some text 1."},{"name":"Item 2","text":"Some special text 2."},{"name":"Item 3","optional2":"more options","text":"Some text 3."},{"name":"Item 1","text":"1."},{"name":"Item 2","text":"2."},{"name":"Item 2","text":"Some special text 2."},{"name":"Item 1","text":"Some text 1.","url":"test.html"}]')
        
    def test_file_output(self):
        out = getPjscrapeOutput('file_output_config.js', 'test_basic.js')
        self.assertEqual(out, '')
        f = open(OUT_FILE)
        out = f.read().strip()
        f.close()
        self.assertEqual(out, '["Test Page: Index","Page 1","Page 2"]')
        os.remove(OUT_FILE)
        
    def test_persistent_state(self):
        out = getPjscrapeOutput('test_persistent_state.js')
        self.assertEqual(out, '["Page 0","Page 1","Page 2"]')
        
if __name__ == '__main__':
    # run tests
    suite = unittest.TestLoader().loadTestsFromTestCase(TestPjscrape)
    unittest.TextTestRunner(verbosity=2).run(suite)