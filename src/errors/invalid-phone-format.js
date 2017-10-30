'use strict'

const BaseError = require('./base')

class InvalidPhoneFormatError extends BaseError {
  constructor () {
    super('The telephone number must be in E.164 format')
  }
}

module.exports = InvalidPhoneFormatError
