const
io = require('socket.io'),
jsonDB = require('./jsonDB.js')

module.exports = app => io(app).of('/crud')
  .on('connection', socket => [
      'all', 'find', 'get', 'set', 'del', 'rep'
    ].map(i => socket.on(i, jsonDB[i]))
  )
