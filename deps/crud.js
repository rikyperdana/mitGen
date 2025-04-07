const
io = require('socket.io'),
jsonDB = require('./jsonDB.js')

// WARNING!!
// This API is for prototyping use only
// Remove or replace with custom API for production

module.exports = app => app.of('/crud')
  .on('connection', socket => [
      'all', 'find', 'get', 'some', 'set', 'del', 'rep'
    ].map(i => socket.on(i, jsonDB[i]))
  )
