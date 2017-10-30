'use strict'

const Client = require('./client')
const Errors = require('./errors')

exports.createClient = (opts) => {
  return new Client(opts || {})
}

exports.Errors = Errors
