const path = require('path')

module.exports = {
  build: {
    lib: {
      entry: path.resolve(__dirname, 'index.html'),
      name: 'gun-avatar',
    },
    rollupOptions: {},
  },
}
