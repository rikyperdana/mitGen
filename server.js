const
express = require('express'),
userMgtSys = require('./deps/ums.js'),

ands = arr => arr.reduce(
  (acc, inc) => acc && inc, true
),

app = express()
  .use(express.static('public'))
  .listen(3000)

userMgtSys(app)