function sum(a, b) {
  if (typeof(a) === 'number' && typeof(b) === 'number')
    return a+b;
  else
    throw TypeError();
}

module.exports = sum;
