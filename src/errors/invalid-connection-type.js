'use strict'

const BaseError = require('./base')

class InvalidConnectionTypeError extends BaseError {
  constructor (connType) {
    super(`Invalid connection type ${connType}`)
  }
}

module.exports = InvalidConnectionTypeError
