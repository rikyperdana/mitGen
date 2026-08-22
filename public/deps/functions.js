const
socket = io(),
randomId = x => Math.random().toString(36).slice(2),
dbCall = (obj, cb) => socket.emit('dbCall', obj, cb),
db = new Dexie('openjek'),
tern = (a, b, c) => a ? b : c,
hari = (timestamp, hour) =>
  timestamp && moment(timestamp)
  .format('Do MMMM YYYY'+(hour ? ', hh:mm' : '')),

sum = arr => arr.reduce((a, b) => a + b, 0),
matches = (a, b) => new RegExp(a, 'i').test(b),
roundNum = num => Math.round(num * 10) / 10,
distCalc = (pos1, pos2) => roundNum(sum([
  Math.abs(pos1.lat - pos2.lat),
  Math.abs(pos1.lon - pos2.lon)
]) * 111),

findPlaces = (word, pos, pin, cb) =>
          // (*   , -  , -  , * )
  db.places.filter(i => ands([
    // matching places name
    matches(word, i.name)
  ])).toArray().then(
    res => res.map(i => ({
      ...i, dist: pos ? distCalc(pos, i.pos) : 0
    })) // sort ascended distance
    .sort((a, b) => a.dist - b.dist)
  ).then(res => [
    state.currentPos && {
      id: 'geo', name: 'Lokasi sekarang',
      pos: state.currentPos
    },
    pin && {
      id: 'pin', name: 'Titik di peta',
      pos: {lat: pin.lat, lon: pin.lng}
    },
    ...res
  ].filter(Boolean)).then(cb),

makeModal = name => m('.modal',
  {class: state[name] && 'is-active'},
  m('.modal-background'),
  m('.modal-content', state[name]),
  m('.modal-close.is-large', {onclick: () =>
    [state[name] = null, m.redraw()]
  }) // BUG: modal tidak mempan m.redraw()
)

db.version(1).stores({
  places: 'id, name, pos.lat, pos.lon'
})
