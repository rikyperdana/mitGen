const
io = require('socket.io'),
jsonDB = require('./jsonDB.js')

module.exports = app => app.of('/crud')
  .on('connection', socket => [
      'all', 'find', 'get', 'some', 'set', 'del', 'rep'
    ].map(i => socket.on(i, jsonDB[i]))
  )
