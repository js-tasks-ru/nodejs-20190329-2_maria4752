const url = require('url');
const http = require('http');
const path = require('path');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':
      if (pathname.indexOf('/') != -1) {
        res.statusCode = 400;
        res.end('Error 400');
        break;
      }
      const stream = fs.createReadStream(filepath);
      let data = '';
      stream.on('error', (error) => {
        res.statusCode = 404;
        res.end('Error 404');
        console.log('fffffuck' + error);
      });

      stream.on('data', (chunk) => {
        data += chunk;
      });

      stream.pipe(res);
      stream.on('close', () => {});
      stream.on('end', () => {});

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
