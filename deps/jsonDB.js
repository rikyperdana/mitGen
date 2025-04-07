const fs = require('fs'),
withAs = (obj, cb) => cb(obj),
fromPairs = arr => arr.reduce(
  (acc, val) => ({...acc,
    [val[0]]: val[1]
  }), {}
)

module.exports = {

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

  find: (coll, filter, cb) => fs.readFile(
    `./db/${coll}.json`, 'utf8', (err, res) => withAs(
      JSON.parse(res), allData => cb(fromPairs(
        Object.entries(allData).filter(
          row => eval(filter)(row[1])
          // pass the string version of filter function
          // just use the (x => x).toString()
        )
      ))
    )
  ),

  some: (coll, list, cb) => fs.readFile(
    `./db/${coll}.json`, 'utf8', (err, res) => withAs(
      JSON.parse(res), allData => cb(fromPairs(
        Object.entries(allData).filter(
          row => list.includes(row[0])
          // list of keys to be retrieved
        )
      ))
    )
  ),

  rep: (coll, data, cb) => fs.writeFile(
    `./db/${coll}.json`, // replace the entire content
    JSON.stringify(data, null, 2),
    err => cb({status: !err})
  )
}
