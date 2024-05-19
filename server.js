const fs = require('fs'),
io = require('socket.io'),
{nanoid} = require('nanoid'),
express = require('express'),
bcrypt = require('bcryptjs'),
jsonDB = require('./deps/jsonDB.js'),

{parse, stringify} = JSON, withAs = (obj, cb) => cb(obj),
ands = arr => arr.reduce((acc, inc) => acc && inc, true),

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

  socket.on('signin', (user, cb) => jsonDB.all(
    'users', allUsers => withAs(Object.entries(allUsers).find(
      record => record[1].username === user.username
    ), foundUser => foundUser ? bcrypt.compare(
      user.password, foundUser[1].password,
      (err, similar) => similar
        ? withAs([nanoid(), +(new Date())], misc => jsonDB.set(
          'users', foundUser[0],
          {...foundUser[1], token: misc[0], lastLogin: misc[1]},
          res => cb({status: true, token: misc[0]})
        )) : cb({status: false, msg: 'Incorrect password.'})
    ) : cb({status: false, msg: 'User not found.'}))
  )),

  socket.on('signout', (user, cb) => jsonDB.all(
    'users', allUsers => withAs(
      Object.entries(allUsers).find(record => ands([
        record[1].username === user.username,
        record[1].token === user.token
      ])), foundUser => foundUser ? jsonDB.set(
        'users', foundUser[0], {...foundUser[1], token: 0},
        res => cb({status: true, msg: 'Sign out successful.'})
      ) : cb({status: false, msg: 'Incorrect token.'})
    )
  )),

  socket.on('grantAccess', (admin, user, cb) => jsonDB.all(
    'users', allUsers => withAs(
      Object.entries(allUsers).find(rec => ands([
        rec[1].access.includes('superadmin'),
        rec[1].username === admin.username,
        rec[1].token === admin.token
      ])), checkAdmin => checkAdmin && bcrypt.compare(
        admin.password, checkAdmin[1].password, (err, equal) =>
        equal ? jsonDB.set('users', user.id, user, cb)
        : cb({status: false, msg: "You're not superadmin."})
      )
    )
  ))
])