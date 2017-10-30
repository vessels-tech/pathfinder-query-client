'use strict'

const BaseError = require('./base')

class QueryFormatError extends BaseError {
  constructor () {
    super('There was a problem with the format of the query')
  }
}

module.exports = QueryFormatError
