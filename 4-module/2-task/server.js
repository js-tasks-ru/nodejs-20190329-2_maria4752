const url = require('url');
const http = require('http');
const path = require('path');

const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');
const LimitExceededError = require('./LimitExceededError');
const server = new http.Server();

function removeFile(path) {
  console.log('removed');
  fs.unlink(path, (err) =>{});
}

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  if (pathname.indexOf('/') !== -1) {
    res.statusCode = 400;
    res.end();
    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);

  req.on('error', () => {
    res.statusCode = 500;
    res.end();
  })
  res.on('error', () => {
    res.statusCode = 500;
    res.end();
  })
  req.on('aborted', () => removeFile(filepath));

  switch (req.method) {
    case 'POST':
      fs.access(filepath, fs.constants.F_OK, (err) => {
        if (!err){
          res.statusCode = 409;
          res.end();
        } else {
          const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});
          const limit = new LimitSizeStream({limit: 1024*1024});
          limit.on('error', (err) => {
            if (err instanceof LimitExceededError) {
              removeFile(filepath);
              res.statusCode = 413;
              res.end();
            }
            res.statusCode = 500;
            res.end();
          });

          writeStream.on('error', (err) => {
            removeFile(filepath);
            res.statusCode = 500;
            res.end();
          });
          writeStream.on('finish', () => {
            res.statusCode = 201;
            res.end();
          });
          req.pipe(limit).pipe(writeStream);

          return;
        }
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
