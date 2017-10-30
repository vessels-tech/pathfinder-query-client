'use strict'

const ServerFailError = require('./server-fail')
const QueryFormatError = require('./query-format')
const UnauthorizedError = require('./unauthorized')
const RequestTimeoutError = require('./request-timeout')
const UnhandledRcodeError = require('./unhandled-rcode')
const InvalidPhoneFormatError = require('./invalid-phone-format')
const InvalidPhoneNumberError = require('./invalid-phone-number')
const InvalidConnectionTypeError = require('./invalid-connection-type')

module.exports = {
  ServerFailError,
  QueryFormatError,
  UnauthorizedError,
  RequestTimeoutError,
  UnhandledRcodeError,
  InvalidPhoneFormatError,
  InvalidPhoneNumberError,
  InvalidConnectionTypeError
}
