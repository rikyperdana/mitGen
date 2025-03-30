const
io = require('socket.io'),
jsonDB = require('./jsonDB.js')

module.exports = app => io(app).of('/crud').on('connection', socket => [
  socket.on('all', jsonDB.all), socket.on('set', jsonDB.set),
])
