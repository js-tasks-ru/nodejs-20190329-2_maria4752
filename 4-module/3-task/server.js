const url = require('url');
const http = require('http');
const path = require('path');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  if (pathname.indexOf('/') != -1) {
    res.statusCode = 400;
    res.end('Error 400');
  }
  const filepath = path.join(__dirname, 'files', pathname);
  fs.access(filepath, fs.constants.F_OK, (err) => {
    if (err) {
      res.statusCode = 404;
      res.end('Error 404 - Not found');
    }
  });
  switch (req.method) {
    case 'DELETE':
      fs.unlink(filepath, (err) => {
        if (err) {
          res.statusCode = 500;
          res.end('Error 500');
        }
        console.log('Deleted.');
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
