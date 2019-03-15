'use strict'

const src = '../../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Packet = require('native-dns-packet')
const DnsResponse = require(`${src}/dns/response`)

Test('DnsResponse', dnsResponseTest => {
  let sandbox

  dnsResponseTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(Packet, 'parse')
    t.end()
  })

  dnsResponseTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  dnsResponseTest.test('create should', createTest => {
    createTest.test('create response', test => {
      let response = new DnsResponse()

      test.ok(response)
      test.ok(DnsResponse.parse)
      test.end()
    })

    createTest.end()
  })

  dnsResponseTest.end()
})
