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
    // check if the user already exists
    Object.entries(access('users').JSON()).find(
      i => i[1].username === user.username
    ), foundUser => foundUser
      // if it is, then reject registration
      ? cb({status: false, msg: 'User already registered.'})
      // if not, then hash the password first
      : bcrypt.hash(`${user.password}`, 10, (err, hash) => withAs(
        {...user, id: randomId(), password: hash},
        newUser => [
          // record the user with hash password
          access('users').set(newUser.id, newUser),
          // respond success to the user
          cb({...newUser, password: '*****'})
        ]
      ))
  )),

  socket.on('login', (user, cb) => withAs(
    // check if the user exists
    Object.entries(access('users').JSON()).find(
      i => i[1].username === user.username
    ), foundUser => !foundUser
      // if it doesn't, reject login
      ? cb({status: false, msg: 'User not found.'})
      // if it does, then compare password and the hash
      : bcrypt.compare(
        user.password, foundUser[1].password,
        (err, similar) => !similar
          // if it isn't similar, reject login
          ? cb({status: false, msg: 'Incorrect password.'})
          // but if it is, then generate a new token
          : withAs(randomId(), token => [
            // store the token in his record
            access('users').set(foundUser[1].id, {
              ...foundUser[1], token
            }),
            // respond success with the token
            cb({...foundUser[1], password: '*****', token})
          ])
      )
  )),

  socket.on('logout', (user, cb) => withAs(
    // check if the user exists
    Object.entries(access('users').JSON()).find(
      i => i[1].username === user.username
    ), foundUser => foundUser[1].token !== user.token
      // if the token he is holding is incorrect
      ? cb({status: false, msg: "You're not authorized."})
      // but if it is, then..
      : [
        // remove token from his record
        access('users').set(foundUser[1].id, {
          ...foundUser[1], token: 0
        }),
        // respond with logout success
        cb({status: true, msg: 'Logout successful.'})
      ]
  ))

])