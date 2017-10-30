'use strict'

const BaseError = require('./base')

class InvalidPhoneNumberError extends BaseError {
  constructor () {
    super('The telephone number is not valid in PathFinder')
  }
}

module.exports = InvalidPhoneNumberError
