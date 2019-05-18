const mongoose = require('mongoose');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

mongoose.set('debug', true);
mongoose.connect('mongodb://localhost/test');

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [
      {
        validator(v) {
          return /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(v);
        },
        message: (props) => `${props.value} некорректный!`,
      },
    ],
    lowercase: true,
    trim: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', schema);
