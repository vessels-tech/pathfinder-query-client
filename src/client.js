'use strict'

const P = require('bluebird')
const Dns = require('./dns')
const Result = require('./result')
const Converter = require('./converter')
const Errors = require('./errors')
const Connection = require('./connection')
const DnsRequest = require('./dns/request')
const DnsResponse = require('./dns/response')

class Client {
  constructor (opts) {
    this._address = opts.address || 'localhost'
    this._port = opts.port || 53
    this._type = opts.type || 'udp'
    this._timeout = opts.timeout || 5000
    this._enumSuffix = opts.enumSuffix || 'e164enum.net'

    this._rCodeErrorMappings = {
      1: Errors.QueryFormatError,
      2: Errors.ServerFailError,
      3: Errors.InvalidPhoneNumberError,
      5: Errors.UnauthorizedError
    }

    this._connection = this._createConnection()
  }

  request (phone) {
    return P.try(() => {
      this._validatePhoneNumber(phone)

      const enumDomain = Converter.convertE164ToEnumDomain(phone, this._enumSuffix)

      const dnsRequest = DnsRequest.create(Dns.NAPTR({ name: enumDomain }))

      const requestData = dnsRequest.write(this._connection.getBaseSize())
      return this._connection.send(requestData).then(this._handleResponse.bind(this))
    })
  }

  _handleResponse (response) {
    const dnsResponse = DnsResponse.parse(response)
    this._validateDnsResponse(dnsResponse)

    return Result.fromDnsResponse(dnsResponse)
  }

  _createConnection () {
    if (this._type === 'udp') {
      return Connection.createUdpConnection({ address: this._address, port: this._port, timeout: this._timeout })
    } else {
      throw new Errors.InvalidConnectionTypeError(this._type)
    }
  }

  _validateDnsResponse (dnsResponse) {
    const rcode = dnsResponse.header.rcode
    if (rcode !== 0) {
      const MappedError = this._rCodeErrorMappings[rcode]
      if (MappedError) {
        throw new MappedError()
      } else {
        throw new Errors.UnhandledRcodeError(rcode)
      }
    }
  }

  _validatePhoneNumber (phone) {
    // Validate is E.164 format.
    let valid = /^\+?[1-9]\d{4,14}$/.test(phone)
    if (!valid) {
      throw new Errors.InvalidPhoneFormatError()
    }
  }
}

module.exports = Client
