const
randomId = x => Math.random().toString(36).slice(2),
dbCall = (obj, cb) => io().emit('dbCall', obj, cb)
// obj = {action*, coll*, key*, value: String}