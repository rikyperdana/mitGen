const
io = require('socket.io'),
express = require('express'),
bcrypt = require('bcryptjs'),
JSONdb = require('simple-json-db'),
access = name => new JSONdb(
  `./db/${name}.json`, {jsonSpaces: 2}
),

{parse, stringify} = JSON,
withAs = (obj, cb) => cb(obj),
randomId = x => Math.random().toString(36).slice(2),

app = express()
  .use(express.static('public'))
  .listen(3000)

io(app).on('connection', socket => [

  socket.on('dbCall', (obj, cb) => ({
    get: _ => cb(access(obj.coll).get(obj.key)),
    del: _ => cb(access(obj.coll).delete(obj.key)),
    set: _ => [access(obj.coll).set(obj.key, obj.value), cb(true)],
    json: _ => cb(access(obj.coll).JSON()),
    repl: _ => access(obj.coll).JSON(obj.replace)
  })[obj.action]()),

  socket.on('register', (user, cb) => withAs(
    Object.entries(access('users').JSON()).find(
      i => i[1].username === user.username
    ), foundUser => foundUser
      ? cb({status: false, msg: 'User already registered.'})
      : bcrypt.hash(`${user.password}`, 10, (err, hash) => withAs(
        {...user, id: randomId(), password: hash},
        newUser => [
          access('users').set(newUser.id, newUser),
          cb({...newUser, password: '*****'})
        ]
      ))
  )),

])