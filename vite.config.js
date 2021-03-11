const path = require('path')

module.exports = {
  build: {
    lib: {
      entry: path.resolve(__dirname, 'main.js'),
      name: 'gun-avatar',
    },
    rollupOptions: {},
  },
}
