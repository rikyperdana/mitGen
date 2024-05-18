const fs = require('fs'),
io = require('socket.io'),
{nanoid} = require('nanoid'),
express = require('express'),
bcrypt = require('bcryptjs'),
JSONdb = require('simple-json-db'),
access = name => new JSONdb(`./db/${name}.json`),

{parse, stringify} = JSON, withAs = (obj, cb) => cb(obj),
ands = arr => arr.reduce((acc, inc) => acc && inc, true),

jsonDB = {

  set: (coll, key, data, cb) => fs.readFile(
    `./db/${coll}.json`, 'utf8', (err, existing) =>
    existing ? fs.writeFile( // find existing file
      `./db/${coll}.json`, // if it's found
      JSON.stringify({ // combine with the data
        ...JSON.parse(existing), [key]: data
      }, null, 2),
      err => cb({status: !err})
    ) : fs.writeFile( // if it doesn't
      `./db/${coll}.json`, // just write a new one
      JSON.stringify({[key]: data}, null, 2),
      err => cb({status: !err})
    )
  ),

  get: (coll, key, cb) => fs.readFile(
    `./db/${coll}.json`, 'utf8', // get the specified key
    (err, res) => res && cb(JSON.parse(res)[key])
  ),

  del: (coll, key, cb) => fs.readFile(
    `./db/${coll}.json`, 'utf8', // get existing data
    (err, res) => withAs(JSON.parse(res), existing => [
      delete existing[key], fs.writeFile( // delete the pair
        `./db/${coll}.json`, // overwrite the old json
        JSON.stringify(existing, null, 2),
        err => cb({status: !err})
      )
    ])
  ),

  all: (coll, cb) => fs.readFile(
    `./db/${coll}.json`, 'utf8', // get all contents
    (err, res) => res && cb(JSON.parse(res))
  ),

  rep: (coll, data, cb) => fs.writeFile(
    `./db/${coll}.json`, // replace the entire content
    JSON.stringify(data, null, 2),
    err => cb({status: !err})
  )
},

app = express()
  .use(express.static('public'))
  .listen(3000)

io(app).on('connection', socket => [

  /* -------------- User Management System --------------- */

  socket.on('signup', (user, cb) => jsonDB.all(
    'users', allUsers => Object.entries(allUsers).find(
      record => record[1].username === user.username
    ) ? cb({status: false, msg: 'User already registered.'})
    : bcrypt.hash(`${user.password}`, 10, (err, hash) => withAs(
      nanoid(), id => jsonDB.set('users', id, {
        ...user, id, password: hash, access: []
      }, cb)
    ))
  )),

  socket.on('Xsignup', (user, cb) => withAs(
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

  socket.on('Xsignin', (user, cb) => withAs(
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

  socket.on('Xsignout', (user, cb) => withAs(
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

  socket.on('XgrantAccess', (admin, user, cb) => withAs(
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
  )),

  /* ------------------------------------------------- */

  /* DANGER ZONE, dev only
  socket.on('dbCall', (obj, cb) => ({
    get: _ => cb(access(obj.coll).get(obj.key)),
    del: _ => cb(access(obj.coll).delete(obj.key)),
    set: _ => [access(obj.coll).set(obj.key, obj.value), cb(true)],
    json: _ => cb(access(obj.coll).JSON()),
    repl: _ => access(obj.coll).JSON(obj.replace) // BUG
  })[obj.action]()),
  */

])