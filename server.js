const express = require('express'),
userMgtSys = require('./deps/ums.js'),

app = express()
  .use(express.static('public'))
  .listen(3000)

userMgtSys(app)