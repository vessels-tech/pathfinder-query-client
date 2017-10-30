'use strict'

const BaseError = require('./base')

class UnhandledRcodeError extends BaseError {
  constructor (rcode) {
    super(`Received unhandled rcode: ${rcode}`)
  }
}

module.exports = UnhandledRcodeError
