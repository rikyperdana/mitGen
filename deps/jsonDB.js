const
withAs = (obj, cb) => cb(obj),
string = JSON.stringify,
parse = (obj, fb = {}) => {
  try {return JSON.parse(obj)}
  catch {return fb}
},
fromPairs = arr => arr.reduce(
  (acc, val) => ({...acc,
    [val[0]]: val[1]
  }), {}
),

jsonDB = {

  init: (coll, data, cb) => Deno.writeTextFile(
    // initiate a new file with given data
    `./db/${coll}.json`, string(data, null, 2)
    // res is empty, return true
  ).then(res => cb(true)),

  set: (coll, data, cb) => Deno.readTextFile(`./db/${coll}.json`)
    // make sure that the data exists and read the file contents
    .then(allData => Deno.writeTextFile(`./db/${coll}.json`, string(
      // combine existing contents to the given data
      {...parse(allData), ...data}, null, 2
    )).then(cb).catch(err => cb({err}))),

  get: (coll, key, cb) => Deno.readTextFile(`./db/${coll}.json`)
    // only get specific key from a file address
    .then(res => res && cb(parse(res)[key])),

  del: (coll, key, cb) => Deno.readTextFile(`./db/${coll}.json`)
    // check if the given file address exists
    .then(res => withAs(parse(res), existing => [
      // delete the specified key
      delete existing[key], Deno.writeTextFile(
        // rewrite json for what remains
        `./db/${coll}.json`, JSON.stringify(existing, null, 2)
      ).then(res => cb(existing))
      .catch(err => cb({status: !err}))
    ])),

  all: (coll, cb) => Deno.readTextFile(`./db/${coll}.json`)
    // check if the file exists and read the data
    .then(res => cb(parse(res))).catch(err => cb(false)),
    // return the entire content of the json file

  find: (coll, filter, cb) => Deno.readTextFile(`./db/${coll}.json`)
    .then(res => withAs(parse(res), allData => cb(fromPairs(
      Object.entries(allData).filter(row => eval(filter)(row[1]))
      // pass the string version of filter function
      // just use the (x => x).toString()
    )))),

  some: (coll, list, cb) => Deno.readTextFile(`./db/${coll}.json`).then(
    res => withAs(parse(res), allData => cb(fromPairs(
      Object.entries(allData).filter(row => list.includes(row[0]))
    )))
  ),

  rep: (coll, data, cb) => Deno.writeTextFile(
    `./db/${coll}.json`, JSON.stringify(data, null, 2)
  ).then(res => cb({status: !!res})),

  // For Multi Files

  multiGet: (list, cb) => Promise.all(list.map(
    i => Deno.readTextFile(`./db/${i}.json`)
  )).then(res => cb(res.map(parse))),

  multiInit: (list, cb) => Promise.all(
    // initiate files as in the list
    list.map(i => Deno.writeTextFile(
      `./db/${i.address}.json`,
      JSON.stringify(i.data, null, 2)
    ).then(res => true))
  ).then(cb),

  multiSet: (list, cb) => Promise.all(
    // read each of them json first
    list.map(i => Deno.readTextFile(
      `./db/${i.address}.json`
    ).then(
      res => Deno.writeTextFile(
        `./db/${i.address}.json`,
        // combine each existing with new
        JSON.stringify(Object.assign(
          parse(res), i.data
        ), null, 2)
      ).then(res => true)
    ))
  ).then(cb),

  multiDel: (list, cb) => Promise.all(
    // simply remove files in the given list
    list.map(i => Deno.remove(`./db/${i}.json`))
  ).then(res => cb(true))
}

export { jsonDB }