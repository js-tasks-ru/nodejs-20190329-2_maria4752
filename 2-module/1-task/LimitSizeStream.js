const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor({ limit, encoding}) {
    super();

    this._limit = limit;
    this._encoding = encoding;
    this._summ = 0;

    if (this._encoding)
      this.setEncoding(this._encoding);

    this.on('error', (err) => {console.log(err)});
  }

  _transform(chunk, encoding, callback) {
    if ((this._summ + chunk.length) <= this._limit) {
      this._summ += chunk.length;
      callback(null, chunk);
    } else {
      callback(new LimitExceededError());
    }
  }
}

module.exports = LimitSizeStream;