'use strict'

const BaseError = require('./base')

class UnauthorizedError extends BaseError {
  constructor () {
    super('The source IP is not authorized to access PathFinder')
  }
}

module.exports = UnauthorizedError
