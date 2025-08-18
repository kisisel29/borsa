const http = require('http');
const https = require('https');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname.startsWith('/api/binance/')) {
    // Binance API çağrılarını proxy'le
    const binancePath = parsedUrl.pathname.replace('/api/binance', '');
    const binanceUrl = `https://api.binance.com${binancePath}?${new URLSearchParams(parsedUrl.query).toString()}`;
    
    console.log('Proxying to:', binanceUrl);
    
    const options = {
      method: req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      rejectUnauthorized: false
    };

    const proxyReq = https.request(binanceUrl, options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
      console.error('Proxy error:', error);
      res.writeHead(500);
      res.end('Proxy error');
    });

    req.pipe(proxyReq);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = 3004;
server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
