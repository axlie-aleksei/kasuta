const path = require('path');

module.exports = {
  entry: {
    app: './server/app.server',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './server/app.server',
  },
};
