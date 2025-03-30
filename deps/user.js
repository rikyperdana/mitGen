
const fs = require('fs'),
io = require('socket.io'),
{nanoid} = require('nanoid'),
bcrypt = require('bcryptjs'),
jsonDB = require('./jsonDB.js'),

withAs = (obj, cb) => cb(obj),
ands = arr => arr.reduce(
  (acc, inc) => acc && inc, true
)

module.exports = app => io(app).of('/user').on('connection', socket => [

  socket.on('signup', (user, cb) => console.log('bisa')),

  socket.on('Xsignup', (user, cb) => jsonDB.all(
    'users', allUsers => Object.entries(allUsers).find(
      record => record[1].username === user.username
    ) ? cb({status: false, msg: 'User already registered.'})
    : bcrypt.hash(`${user.password}`, 10, (err, hash) => withAs(
      nanoid(), id => jsonDB.set('users', id, {
        ...user, id, password: hash, access: []
      }, res => cb({status: true, msg: 'Registration successful.'}))
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
    'users', usersJSON => withAs(
      Object.entries(usersJSON), allUsers => withAs(
        allUsers.find(rec => ands([
          rec[1].access.includes('superadmin'),
          rec[1].username === admin.username,
          rec[1].token === admin.token
        ])), checkAdmin => checkAdmin ? bcrypt.compare(
          admin.password, checkAdmin[1].password,
          (err, correctPass) => correctPass ? withAs(
            allUsers.find(rec => rec[1].username === user.username),
            grantedUser => grantedUser ? jsonDB.set(
              'users', grantedUser[0],
              {...grantedUser[1], access: user.access},
              res => cb({status: true, msg: 'Access granted.'})
            ) : cb({status: false, msg: 'User not found.'})
          ) : cb({status: false, msg: 'Incorrect password.'})
        ) : cb({status: false, msg: 'Incorrect credentials.'})
      )
    )
  ))

])
