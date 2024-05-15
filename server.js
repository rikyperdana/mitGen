const
io = require('socket.io'),
{nanoid} = require('nanoid'),
express = require('express'),
bcrypt = require('bcryptjs'),
JSONdb = require('simple-json-db'),
access = name => new JSONdb(
  `./db/${name}.json`, {jsonSpaces: 2}
),

{parse, stringify} = JSON, withAs = (obj, cb) => cb(obj),
ands = arr => arr.reduce((acc, inc) => acc && inc, true),

app = express()
  .use(express.static('public'))
  .listen(3000)

io(app).on('connection', socket => [

  /* -------------- User Management System --------------- */

  socket.on('register', (user, cb) => withAs(
    // check if the user already exists
    Object.entries(access('users').JSON()).find(
      i => i[1].username === user.username
    ), foundUser => foundUser
      // if it is, then reject registration
      ? cb({status: false, msg: 'User already registered.'})
      // if not, then hash the password first
      : bcrypt.hash(`${user.password}`, 10, (err, hash) => withAs(
        {...user, id: nanoid(), password: hash, access: []},
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
          // but if it is, then generate a new token & lastLogin
          : withAs([nanoid(), +(new Date())], misc => [
            // store the token in his record
            access('users').set(foundUser[1].id, {
              ...foundUser[1], token: misc[0],
              lastLogin: misc[1]
            }),
            // respond success with the token
            cb({
              ...foundUser[1], password: '*****',
              token: misc[0]
            })
          ])
      )
  )),

  socket.on('logout', (user, cb) => withAs(
    // check if the user exists
    Object.entries(access('users').JSON()).find(
      i => i[1].username === user.username
      // if the token he is holding is incorrect
    ), foundUser => foundUser[1].token !== user.token
      // then reject the logout request
      ? cb({status: false, msg: "You're not authorized."})
      : [ // but if it is, then..
        // remove token from his record
        access('users').set(foundUser[1].id, {
          ...foundUser[1], token: 0
        }),
        // respond with logout success
        cb({status: true, msg: 'Logout successful.'})
      ]
  )),

  socket.on('grantAccess', (admin, user, cb) => withAs(
    // find the admin record first
    Object.entries(access('users').JSON()).find(i => ands([
      i[1].access.includes('superadmin'),
      i[1].username === admin.username,
      i[1].token === admin.token
    ])), checkAdmin => checkAdmin && bcrypt.compare(
      // is he really a super admin?
      admin.password, checkAdmin[1].password,
      (err, similar) => !similar
        // if he isn't, then reject grantAccess
        ? cb({status: false, msg: "You're not a super admin."})
        : withAs(
          // if he is, find the user to be granted access
          Object.entries(access('users').JSON()).find(
            i => i[1].username === user.username
          ), grantUser => grantUser && [
            // store the granted access in the user record
            access('users').set(grantUser[1].id, {
              ...grantUser[1], access: user.access
            }),
            // respond with successful changes
            cb({status: true, msg: 'Access successfully granted.'})
          ]
        )
    )
  ))

  /* ------------------------------------------------- */

  /* DANGER ZONE, dev only
  socket.on('dbCall', (obj, cb) => ({
    get: _ => cb(access(obj.coll).get(obj.key)),
    del: _ => cb(access(obj.coll).delete(obj.key)),
    set: _ => [access(obj.coll).set(obj.key, obj.value), cb(true)],
    json: _ => cb(access(obj.coll).JSON()),
    repl: _ => access(obj.coll).JSON(obj.replace)
  })[obj.action]()),
  */

])