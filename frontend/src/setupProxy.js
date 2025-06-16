const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to the backend server
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL || 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/api': '/api', // No rewrite needed
      },
      onProxyReq: (proxyReq, req, res) => {
        // Log proxy requests
        console.log(`Proxying ${req.method} ${req.url} to ${process.env.REACT_APP_API_URL || 'http://localhost:5000'}`);
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({ 
          message: 'Proxy error. The backend server may be down or unreachable.',
          error: err.message
        }));
      }
    })
  );
};