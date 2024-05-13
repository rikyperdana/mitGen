const
io = require('socket.io'),
express = require('express'),
JSONdb = require('simple-json-db'),
getColl = name => new JSONdb(`./db/${name}.json`),

app = express()
  .use(express.static('public'))
  .listen(3000)

io(app).on('connection', socket => [

  socket.on('dbCall', (obj, cb) => ({
    json: _ => cb(getColl(obj.coll).JSON()),
    get: _ => cb(getColl(obj.coll).get(obj.key)),
    del: _ => cb(getColl(obj.coll).delete(obj.key)),
    repl: _ => cb(getColl(obj.coll).JSON(obj.replace)),
    set: _ => cb(getColl(obj.coll).set(obj.key, obj.value))
  })[obj.action]()),

  socket.on('test', (obj, cb) => cb({status: true}))
])