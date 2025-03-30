const express = require('express'),
userAPI = require('./deps/user.js'),
crudAPI = require('./deps/crud.js'),

app = express()
  .use(express.static('public'))
  .listen(3000)

userAPI(app)
crudAPI(app)
