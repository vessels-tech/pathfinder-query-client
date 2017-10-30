'use strict'

const BaseError = require('./base')

class RequestTimeoutError extends BaseError {
  constructor (timeout) {
    super(`Request timed out after ${timeout} milliseconds`)
  }
}

module.exports = RequestTimeoutError
