const stream = require('stream');

const fs = require('fs');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.on('error', (err) => {
      console.log(err);
    });
  }

  _transform(chunk, encoding, callback) {
    if (this.endOfString == null || this.endOfString == undefined ) this.endOfString = '';
    const lines = ( this.endOfString + chunk.toString()).split(`${os.EOL}`);

    this.endOfString = lines.pop();
    for (let i = 0; i < lines.length; i++) {
      this.push(lines[i]);
    }
    callback();
  }

  _flush(callback) {
    callback(null, this.endOfString);
  }
}

module.exports = LineSplitStream;
