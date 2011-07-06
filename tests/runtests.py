import SimpleHTTPServer
import SocketServer
import threading
import unittest
import subprocess
import os

PORT = 8888
COMMAND_BASE = ["pyphantomjs", os.path.join('..', 'pjscrape.js')]


class TestPjscrapeStdout(unittest.TestCase):

    def test_basic(self):
        out = subprocess.check_output(COMMAND_BASE + ['test_basic.js']).strip()
        self.assertEqual(out, '["Test Page: Index","Page 1","Page 2"]', 
            "Basic scraper failed, got: " + out)
            
    def test_multiple_urls(self):
        out = subprocess.check_output(COMMAND_BASE + ['test_multiple_urls.js']).strip()
        self.assertEqual(out, '["Test Page: Index","Test Page: Page 1","Test Page: Page 2"]', 
            "Failed, got: " + out)
            
    def test_multiple_suites(self):
        out = subprocess.check_output(COMMAND_BASE + ['test_multiple_suites.js']).strip()
        self.assertEqual(out, '["Test Page: Index","Test Page: Page 1","Test Page: Page 2"]', 
            "Failed, got: " + out)
            
    def test_recursive_maxdepth(self):
        out = subprocess.check_output(COMMAND_BASE + ['test_recursive_maxdepth.js']).strip()
        self.assertEqual(out, '["Test Page: Index","Test Page: Page 1","Test Page: Page 2"]', 
            "Failed, got: " + out)
            
    def test_recursive_nomaxdepth(self):
        out = subprocess.check_output(COMMAND_BASE + ['test_recursive_nomaxdepth.js']).strip()
        self.assertEqual(out, '["Test Page: Index","Test Page: Page 1","Test Page: Page 2","Test Page: Page 3","Test Page: Page 4"]', 
            "Failed, got: " + out)
            
    def test_csv(self):
        out = subprocess.check_output(COMMAND_BASE + ['test_csv.js']).strip()
        # not sure why stdout uses \r\r\n, but that seems to be the case
        self.assertEqual(out, '"a","b","c","d","e"\r\r\n"1","string","string\'s","a ""quoted"" string","111"\r\r\n"2","string","string\'s","a ""quoted"" string","222"\r\r\n"3","string","string\'s","a ""quoted"" string","333"', 
            "Failed, got: " + out)
            
    def test_csv_autofields(self):
        out = subprocess.check_output(COMMAND_BASE + ['test_csv_autofields.js']).strip()
        self.assertEqual(out, '"Column 1","Column 2","Column 3","Column 4","Column 5"\r\r\n"1","string","string\'s","a ""quoted"" string","111"\r\r\n"2","string","string\'s","a ""quoted"" string","222"\r\r\n"3","string","string\'s","a ""quoted"" string","333"', 
            "Failed, got: " + out)
            
    def test_csv_autofields_obj(self):
        out = subprocess.check_output(COMMAND_BASE + ['test_csv_autofields_obj.js']).strip()
        self.assertEqual(out, '"a","b","c","d","e"\r\r\n"1","string","string\'s","a ""quoted"" string","111"\r\r\n"2","string","string\'s","a ""quoted"" string","222"\r\r\n"3","string","string\'s","a ""quoted"" string","333"', 
            "Failed, got: " + out)
            
    def test_prescrape(self):
        out = subprocess.check_output(COMMAND_BASE + ['test_prescrape.js']).strip()
        self.assertEqual(out, '["test1","test2"]', 
            "preScrape failed, got: " + out)
            
    def test_loadscript(self):
        out = subprocess.check_output(COMMAND_BASE + ['test_loadscript.js']).strip()
        self.assertEqual(out, '["test1","test2"]', 
            "loadScript failed, got: " + out)
            
    def test_syntax(self):
        out = subprocess.check_output(COMMAND_BASE + ['test_syntax.js']).strip()
        self.assertEqual(out, '["Test Page: Index","Page 1","Test Page: Index","Page 1","Page 2"]', 
            "Syntax test failed, got: " + out)
            
    def test_ready(self):
        out = subprocess.check_output(COMMAND_BASE + ['test_ready.js']).strip()
        self.assertEqual(out, '["Content 1","Content 2"]', 
            "Ready test failed, got: " + out)
        
if __name__ == '__main__':
    # set up server
    httpd = SocketServer.TCPServer(("", PORT), SimpleHTTPServer.SimpleHTTPRequestHandler)
    httpd_thread = threading.Thread(target=httpd.serve_forever)
    httpd_thread.setDaemon(True)
    httpd_thread.start()
    # run tests
    unittest.main()
    # tear down server
    httpd.shutdown()