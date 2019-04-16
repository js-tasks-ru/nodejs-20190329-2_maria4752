const url = require('url');
const http = require('http');
const path = require('path');

const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');
const LimitExceededError = require('./LimitExceededError');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  if (pathname.indexOf('/') !== -1) {
    res.statusCode = 400;
    res.end();
    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);


  switch (req.method) {
    case 'POST':

      req.on('error', () => {
        res.statusCode = 500;
        res.end();
      });
      res.on('error', () => {
        res.statusCode = 500;
        res.end();
      });
      req.on('aborted', () => {
        fs.unlink(filepath, (err) => {
          if (err) {
            res.statusCode = 500;
            res.end();
          }
        });
      });

      const wstream = fs.createWriteStream(filepath, {flags: 'wx'});
      fs.access(filepath, fs.constants.F_OK, (err) => {
        if (!err) {
          res.statusCode = 409;
          res.end();
        }
      });
      wstream
          .on('error', (err) => {
            res.statusCode = 500;
            res.end();
          })
          .on('close', () => {
            res.statusCode = 201;
            res.end();
          });
      const limit = new LimitSizeStream({limit: 1048576});
      limit.on('error', (error) => {
        if (error instanceof LimitExceededError) {
          fs.unlink(filepath, (err) => {
            if (!err) {
              res.statusCode = 413;
              res.end();
            }
          });
          res.statusCode = 500;
          res.end();
        };
      });
      req.limit.pipe(wstream);

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
