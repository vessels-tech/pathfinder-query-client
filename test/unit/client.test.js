'use strict'

const src = '../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const P = require('bluebird')
const Client = require(`${src}/client`)
const Converter = require(`${src}/converter`)
const Errors = require(`${src}/errors`)
const Dns = require(`${src}/dns`)
const Result = require(`${src}/result`)
const Connection = require(`${src}/connection`)
const DnsRequest = require(`${src}/dns/request`)
const DnsResponse = require(`${src}/dns/response`)

Test('Client', clientTest => {
  let sandbox

  clientTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(Converter, 'convertE164ToEnumDomain')
    sandbox.stub(Dns, 'NAPTR')
    sandbox.stub(Result, 'fromDnsResponse')
    sandbox.stub(DnsRequest, 'create')
    sandbox.stub(DnsResponse, 'parse')
    sandbox.stub(Connection, 'createUdpConnection')
    t.end()
  })

  clientTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  const createClient = (opts) => {
    return new Client(opts || {})
  }

  const buildParsedDnsResponse = (rcode = 0) => {
    return { header: { rcode } }
  }

  clientTest.test('constructor should', constructorTest => {
    constructorTest.test('create client using provided options', test => {
      let opts = { address: 'test.com', port: 3000, type: 'udp', timeout: 3000, enumSuffix: 'e164.arpa' }

      let client = createClient(opts)

      test.equal(client._address, opts.address)
      test.equal(client._port, opts.port)
      test.equal(client._type, opts.type)
      test.equal(client._timeout, opts.timeout)
      test.equal(client._enumSuffix, opts.enumSuffix)
      test.end()
    })

    constructorTest.test('create client using default options', test => {
      let client = createClient()

      test.equal(client._address, 'localhost')
      test.equal(client._port, 53)
      test.equal(client._type, 'udp')
      test.equal(client._timeout, 5000)
      test.equal(client._enumSuffix, 'e164enum.net')
      test.end()
    })

    constructorTest.test('create UDP connection by default', test => {
      let opts = { address: 'test.com', port: 3000, timeout: 10000 }
      let udpConnection = {}

      Connection.createUdpConnection.returns(udpConnection)

      let client = createClient(opts)

      test.equal(client._connection, udpConnection)
      test.ok(Connection.createUdpConnection.calledWith(opts))
      test.end()
    })

    constructorTest.test('throw error if invalid type', test => {
      let opts = { address: 'test.com', port: 3000, type: 'tcp', timeout: 3000, enumSuffix: 'e164.arpa' }

      try {
        createClient(opts)
        test.fail('Should have thrown')
        test.end()
      } catch (err) {
        test.equal(err.name, 'InvalidConnectionTypeError')
        test.equal(err.message, 'Invalid connection type tcp')
        test.end()
      }
    })

    constructorTest.end()
  })

  clientTest.test('request should', requestTest => {
    requestTest.test('create DNS request and send to connection', test => {
      const e164Phone = '+15551234567'
      const enumDomain = '7.6.5.4.3.2.1.5.5.5.1.e164enum.net'

      let sendResponse = 'response'
      let sendStub = sandbox.stub()
      sendStub.returns(P.resolve(sendResponse))

      const udpBaseSize = 512
      let udpConnection = { send: sendStub, getBaseSize: () => udpBaseSize }
      Connection.createUdpConnection.returns(udpConnection)

      Converter.convertE164ToEnumDomain.returns(enumDomain)

      let dnsRequestData = Buffer.alloc(0)
      let dnsRequest = { write: sandbox.stub().returns(dnsRequestData) }
      DnsRequest.create.returns(dnsRequest)

      let naptrRecord = {}
      Dns.NAPTR.returns(naptrRecord)

      let parsedDnsResponse = buildParsedDnsResponse()
      DnsResponse.parse.returns(parsedDnsResponse)

      let record = {}
      Result.fromDnsResponse.returns(record)

      let client = createClient()
      client.request(e164Phone)
        .then(response => {
          test.ok(response, record)
          test.ok(Converter.convertE164ToEnumDomain.calledWith(e164Phone))
          test.ok(Dns.NAPTR.calledWith({ name: enumDomain }))
          test.ok(DnsRequest.create.calledWith(naptrRecord))
          test.ok(dnsRequest.write.calledWith(udpBaseSize))
          test.ok(sendStub.calledWith(dnsRequestData))
          test.ok(DnsResponse.parse.calledWith(sendResponse))
          test.ok(Result.fromDnsResponse.calledWith(parsedDnsResponse))
          test.end()
        })
    })

    requestTest.test('throw InvalidPhoneFormatError', test => {
      let client = createClient()
      client.request('15551234567888899')
        .then(response => {
          test.fail('Should have thrown error')
          test.end()
        })
        .catch(Errors.InvalidPhoneFormatError, err => {
          test.equal(err.message, 'The telephone number must be in E.164 format')
          test.notOk(Result.fromDnsResponse.called)
          test.end()
        })
        .catch(e => {
          test.fail('Should have throw InvalidPhoneFormatError')
          test.end()
        })
    })

    requestTest.test('throw QueryFormatError', test => {
      let sendStub = sandbox.stub()
      sendStub.returns(P.resolve())

      const udpBaseSize = 512
      let udpConnection = { send: sendStub, getBaseSize: () => udpBaseSize }
      Connection.createUdpConnection.returns(udpConnection)

      let dnsRequestData = Buffer.alloc(0)
      let dnsRequest = { write: sandbox.stub().returns(dnsRequestData) }
      DnsRequest.create.returns(dnsRequest)

      let parsedDnsResponse = buildParsedDnsResponse(1)
      DnsResponse.parse.returns(parsedDnsResponse)

      let client = createClient()
      client.request('+15551234567')
        .then(response => {
          test.fail('Should have thrown error')
          test.end()
        })
        .catch(Errors.QueryFormatError, err => {
          test.equal(err.message, 'There was a problem with the format of the query')
          test.notOk(Result.fromDnsResponse.called)
          test.end()
        })
        .catch(e => {
          test.fail('Should have throw QueryFormatError')
          test.end()
        })
    })

    requestTest.test('throw ServerFailError', test => {
      let sendStub = sandbox.stub()
      sendStub.returns(P.resolve())

      const udpBaseSize = 512
      let udpConnection = { send: sendStub, getBaseSize: () => udpBaseSize }
      Connection.createUdpConnection.returns(udpConnection)

      let dnsRequestData = Buffer.alloc(0)
      let dnsRequest = { write: sandbox.stub().returns(dnsRequestData) }
      DnsRequest.create.returns(dnsRequest)

      let parsedDnsResponse = buildParsedDnsResponse(2)
      DnsResponse.parse.returns(parsedDnsResponse)

      let client = createClient()
      client.request('+15551234567')
        .then(response => {
          test.fail('Should have thrown error')
          test.end()
        })
        .catch(Errors.ServerFailError, err => {
          test.equal(err.message, 'Unable to process the query due to a problem with PathFinder server')
          test.notOk(Result.fromDnsResponse.called)
          test.end()
        })
        .catch(e => {
          test.fail('Should have throw ServerFailError')
          test.end()
        })
    })

    requestTest.test('throw InvalidPhoneNumberError', test => {
      let sendStub = sandbox.stub()
      sendStub.returns(P.resolve())

      const udpBaseSize = 512
      let udpConnection = { send: sendStub, getBaseSize: () => udpBaseSize }
      Connection.createUdpConnection.returns(udpConnection)

      let dnsRequestData = Buffer.alloc(0)
      let dnsRequest = { write: sandbox.stub().returns(dnsRequestData) }
      DnsRequest.create.returns(dnsRequest)

      let parsedDnsResponse = buildParsedDnsResponse(3)
      DnsResponse.parse.returns(parsedDnsResponse)

      let client = createClient()
      client.request('+15551234567')
        .then(response => {
          test.fail('Should have thrown error')
          test.end()
        })
        .catch(Errors.InvalidPhoneNumberError, err => {
          test.equal(err.message, 'The telephone number is not valid in PathFinder')
          test.notOk(Result.fromDnsResponse.called)
          test.end()
        })
        .catch(e => {
          test.fail('Should have throw InvalidPhoneNumberError')
          test.end()
        })
    })

    requestTest.test('throw UnauthorizedError', test => {
      let sendStub = sandbox.stub()
      sendStub.returns(P.resolve())

      const udpBaseSize = 512
      let udpConnection = { send: sendStub, getBaseSize: () => udpBaseSize }
      Connection.createUdpConnection.returns(udpConnection)

      let dnsRequestData = Buffer.alloc(0)
      let dnsRequest = { write: sandbox.stub().returns(dnsRequestData) }
      DnsRequest.create.returns(dnsRequest)

      let parsedDnsResponse = buildParsedDnsResponse(5)
      DnsResponse.parse.returns(parsedDnsResponse)

      let client = createClient()
      client.request('+15551234567')
        .then(response => {
          test.fail('Should have thrown error')
          test.end()
        })
        .catch(Errors.UnauthorizedError, err => {
          test.equal(err.message, 'The source IP is not authorized to access PathFinder')
          test.notOk(Result.fromDnsResponse.called)
          test.end()
        })
        .catch(e => {
          test.fail('Should have throw UnauthorizedError')
          test.end()
        })
    })

    requestTest.test('throw UnhandledRcodeError', test => {
      let sendStub = sandbox.stub()
      sendStub.returns(P.resolve())

      const udpBaseSize = 512
      let udpConnection = { send: sendStub, getBaseSize: () => udpBaseSize }
      Connection.createUdpConnection.returns(udpConnection)

      let dnsRequestData = Buffer.alloc(0)
      let dnsRequest = { write: sandbox.stub().returns(dnsRequestData) }
      DnsRequest.create.returns(dnsRequest)

      let parsedDnsResponse = buildParsedDnsResponse(4)
      DnsResponse.parse.returns(parsedDnsResponse)

      let client = createClient()
      client.request('+15551234567')
        .then(response => {
          test.fail('Should have thrown error')
          test.end()
        })
        .catch(Errors.UnhandledRcodeError, err => {
          test.equal(err.message, `Received unhandled rcode: ${parsedDnsResponse.header.rcode}`)
          test.notOk(Result.fromDnsResponse.called)
          test.end()
        })
        .catch(e => {
          test.fail('Should have throw UnhandledRcodeError')
          test.end()
        })
    })

    requestTest.end()
  })

  clientTest.end()
})
