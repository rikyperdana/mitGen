const express = require('express'),
userAPI = require('./deps/user.js'),
crudAPI = require('./deps/crud.js'),

app = express()
  .use(express.static('public'))
  .listen(3000)

crudAPI(app)
userAPI(app)

// remember that only last module export can survive
