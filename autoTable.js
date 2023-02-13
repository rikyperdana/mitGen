/*global _ m saveAs*/

var atState = {},
ors = array => array.find(Boolean),
ands = array => array.reduce((a, b) => a && b, true),
ifit = (obj, cb) => obj && cb(obj),

autoTable = obj => ({view: () => m('.box',

  m('.columns',

    // search term box
    obj.search && m('.column.is-10', m('form',
      {onsubmit: e => [
        e.preventDefault(),
        _.assign(atState, {[obj.id]: {
          search: _.lowerCase(e.target[0].value)
        }}),
        m.redraw()
      ]},
      m('.control.is-expanded', m('input.input.is-fullwidth', {
        type: 'text', placeholder: 'Search data',
      }))
    )),

    // pagination steps
    obj.showSteps && m('.column.is-2',
      m('.select.is-fullwidth', m('select',
        {onchange: e => [
          _.assign(atState, {[obj.id]: _.merge(
            _.get(atState, obj.id),
            {activeStep: +e.target.value, pagination: 0}
          )})
        ], value: _.get(atState, [obj.id, 'activeStep'])},
        obj.showSteps.map(i => m('option', {value: i}, 'Show '+i))
      ))
    )
  ),

  // filters selection, if available
  obj.filters && m('.columns',
    _.map(obj.filters, (val, key) => m('.column', m('.field',
      m('label.label', key),
      m('.select.is-fullwidth', m('select',
        {
          onchange: e => _.assign(atState, {[obj.id]: _.merge(
            _.get(atState, obj.id), {filters: _.merge(
              _.get(atState, [obj.id, 'filters']) || {},
              {[key]: e.target.value}
            )}
          )}),
          value: _.values(_.get(atState, [obj.id, 'filters']) || {})
          .find(i => val.map(j => j.label).includes(i))
        },
        val.map(i => m('option', {value: i.label}, i.label))
      ))
    ))),
  ),
  _.get(atState, [obj.id, 'filters']) && m('.button.is-warning', {
    onclick: e => [(delete atState[obj.id].filters), m.redraw()]
  }, 'Reset'),

  // additional functions icons
  m('.field.is-grouped', [

    // export table contents to csv
    obj.export && m('.control', m('.button.is-link', {
      onclick: e => saveAs(
        new Blob([
          [obj.rows.map(i => _.values(i.row).join(';')+';\n')],
          {type: 'text/csv;charset=utf-8'}
        ]), obj.export() + '.csv'
      )
    }, 'Export CSV'))
  ]),

  // table contents
  m('.table-container', m('table.table',

    // sortable by column
    m('thead', m('tr', _.map(obj.heads, (i, j) => m('th',
      {onclick: () => [
        _.assign(atState, {[obj.id]: _.merge(
          _.get(atState, obj.id),
          {sortBy: j, sortWay: !_.get(atState, [obj.id, 'sortWay'])}
        )}),
        m.redraw()
      ]},
      // and its direction
      m('div', m('span', i), m('span.icon',
        j === _.get(atState, [obj.id, 'sortBy']) ?
          m('i.fas.fa-angle-' + (
            _.get(atState, [obj.id, 'sortWay']) ?
            'up': 'down'
          ))
        : m('i.fas.fa-sort')
      ))
    )))),

    // rows contents
    m('tbody', obj.rows

      // if filters are available
      .filter(i => ands(_.map(
        _.get(atState, [obj.id, 'filters']),
        (val, key) => obj.filters[key].find(j => j.label === val)
      ).map(j => j.func(i.data))))

      // if search term is available
      .filter(i =>
        _.values(i.row).map(_.lowerCase)
        .join('').includes(_.get(atState, [obj.id, 'search']) || '')
      )

      // sort by column and direction
      .sort((a, b) => _.get(atState, [obj.id, 'sortBy']) &&
        _[_.get(atState, [obj.id, 'sortWay']) ? 'gt' : 'lt'](
          a.row[_.get(atState, [obj.id, 'sortBy'])],
          b.row[_.get(atState, [obj.id, 'sortBy'])]
        ) ? -1 : 1
      )

      // show paginated table
      .slice(
        (_.get(atState, [obj.id, 'activeStep']) || 0) * (_.get(atState, [obj.id, 'pagination']) || 0),
        ((_.get(atState, [obj.id, 'activeStep']) || 0) * (_.get(atState, [obj.id, 'pagination']) || 0))
        + ors([_.get(atState, [obj.id, 'activeStep']), _.get(obj, ['showSteps', 0]), obj.rows.length])
      )

      .map(i => m('tr',
        {onclick: () => obj.onclick(i.data)},
        _.map(obj.heads, (val, key) => m('td', i.row[key]))
      ))
    )
  )),

  // pagination indicators
  m('nav.pagination', m('.pagination-list',
    _.range(
      obj.rows.length / ors([
        _.get(atState, [obj.id, 'activeStep']),
        _.get(obj, ['showSteps', 0])
      ])
    ).map(i => m('div', m('a.pagination-link', {
      class: _.get(atState, [obj.id, 'pagination']) === i && 'is-current',
      onclick: () => [
        _.assign(atState, {[obj.id]: _.merge(
          _.get(atState, obj.id), {
            pagination: i, search: null,
            activeStep: ors([
              _.get(atState, [obj.id, 'activeStep']),
              obj.showSteps[0]
            ])
          }
        )}),
        m.redraw()
      ]
    }, i + 1)))
  ))
)})
