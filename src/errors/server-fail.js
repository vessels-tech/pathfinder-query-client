'use strict'

const BaseError = require('./base')

class ServerFailError extends BaseError {
  constructor () {
    super('Unable to process the query due to a problem with PathFinder server')
  }
}

module.exports = ServerFailError
