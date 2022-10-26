const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware')

const token = 's%3Ad10a18bb-7a25-433e-8b44-76e9fd762d75.MLyf0o1OvmW3lDw3sndPRleu4v7lxVSerH4CXPJKqJY'

const app = express();

const proxyOptions = {
  target: 'http://localhost:8000',
  pathRewrite: { '^/api': '' },
  onProxyRes: function onProxyRes(proxyRes, req, res) {
    console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2))
    //req.session.cookie.pt_session_id = req.session.cookie.pt_session_id || {}
    //req.session.cookie.pt_session_id[targetUrl] = proxyRes.headers['set-cookie']
    proxyRes.headers['set-cookie'] = 'connect.sid='+token
  }
}

var apiProxy = createProxyMiddleware(proxyOptions);

app.use('/api', apiProxy);
app.listen(3001);