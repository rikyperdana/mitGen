const
io      = require('socket.io'),
express = require('express'),
userAPI = require('./deps/user.js'),
crudAPI = require('./deps/crud.js'),

app = express()
  .use(express.static('public'))
  .listen(3000),

IO = io(app)

userAPI(IO)
crudAPI(IO)
