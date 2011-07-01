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