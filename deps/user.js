import { nanoid } from "npm:nanoid"
import { jsonDB } from "./jsonDB.js"
import bcrypt from "npm:bcryptjs@2.4.3";

const
withAs = (obj, cb) => cb(obj),
sum = arr => arr.reduce((a, b) => a + b, 0),
randomId = x => Math.random().toString(36).slice(2, 10),
deepNested = str => [...str.split('').slice(0, 3), str].join('/'),
getKeys = obj => Object.entries(obj).map(i => i[0]),

// Please initiate ../db/users.json with empty {}

userIO = socket => [

  // socket.on('test', (data, cb) => cb(data)),

  socket.on('signup', (user, cb) => jsonDB.get(
    'users', user.username,
    res => res ? cb({status: 0}) : Deno.mkdir(
      `./db/users/${deepNested(user.username)}`,
      {recursive: true}
    ).then(x => jsonDB.set(
      'users', {[user.username]: null}, jsonDB.init(
        `users/${deepNested(user.username)}/account`, user,
        res => res && cb({status: 1})
      )
    ))
  )),

  socket.on('signin', (user, cb) => jsonDB.all(
    // get the username .json
    `users/${deepNested(user.username)}/account`,
    data => data.err
    // tell not found when fail
    ? cb({status: 'User tidak ditemukan'})
    // but if found
    : bcrypt.compare( // bcrypt compare password
      user.password, data.password, (err, match) =>
        // if matched then return the data
        match ? cb(data) : cb({status: 'Salah password'})
    )
  )),

  socket.on('getUser', (user, cb) => jsonDB.all(
    `users/${deepNested(user.username)}/account`,
    res => res.password === user.password && cb(res)
  )),

  socket.on('updateUser', (user, cb) => jsonDB.set(
    `users/${deepNested(user.username)}/account`, user, cb
  )),

  socket.on('applyDriver', (user, cb) => jsonDB.multiSet([
    {address: `users/${deepNested(user.username)}/account`, data: user},
    {address: 'applicants', data: {[user.username]: null}}
  ], res => cb(true))),

  socket.on('getApplicants', cb => jsonDB.all(
    'applicants', res => res && jsonDB.multiGet([
      getKeys(res).map(i => `users/${deepNested(i)}/account`)
    ], cb)
  )),

  socket.on('adminDriverApproval', (user, cb) => jsonDB.set(
    `users/${deepNested(user.username)}/account`, user, res => jsonDB.del(
      'applicants', user.username, res => cb(true)
    )
  )),

  socket.on('driverOn', (driver, cb) => [
    driver.off
    ? driversPool.delete(driver.username)
    : driversPool.set(driver.username, driver),
    // console.log([...driversPool]),
    cb({driver: !driver.off}),
  ]),

  socket.on('riderOn', (rider, cb) => [
    // put him into to waiting list
    ridersPool.set(rider.username, rider),
    // return the potential drivers
    cb([...driversPool.values()].map(i => ({
      ...i, dist: distCalc(i.place.pos, rider.from)
    })).sort((a, b) => a.dist - b.dist))
  ]),

  socket.on('orderOn', (order, cb) => [
    withAs(randomId(), id => ordersPool.set(
      id, {id, ...order}
    )),
    socket.emit(
      'forDriver',
      [...ordersPool].map(i => ({
        ...ridersPool.get(i[1].rider), ...i[1]
      }))
    )
  ]),

  socket.on('driverConfirm', (order, cb) => [
    ridersPool.set(order.rider, {
      ...ridersPool.get(order.rider),
      driver: driversPool.get(order.driver)
    }),
    ordersPool.delete(order.order),
    driversPool.set(order.driver, {
      ...driversPool.get(order.driver),
      onRide: {[order.rider]: order.order}
    }),
    cb(ridersPool.get(order.rider))
  ]),

  socket.on('trafficMonitor', cb => cb({
    driversPool: [...driversPool.values()],
    ridersPool: [...ridersPool.values()],
    ordersPool: [...ordersPool.values()]
  }))

]

export { userIO }