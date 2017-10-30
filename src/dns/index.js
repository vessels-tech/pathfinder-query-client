'use strict'

const Consts = require('native-dns-packet').consts

const supportedTypes = ['NAPTR']

supportedTypes.forEach(function (name) {
  const recordType = Consts.nameToQtype(name)

  const f = (opts) => {
    const obj = {}
    opts = opts || {}
    obj.type = recordType
    obj.class = Consts.NAME_TO_QCLASS.IN
    Object.keys(opts).forEach(function (k) {
      if (opts.hasOwnProperty(k) && ['type', 'class'].indexOf(k) === -1) {
        obj[k] = opts[k]
      }
    })
    return obj
  }
  f.value = recordType

  exports[name] = f
})
