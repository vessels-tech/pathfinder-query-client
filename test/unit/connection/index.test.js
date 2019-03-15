'use strict'

const src = '../../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const DnsConnection = require(`${src}/connection`)
const UdpConnection = require(`${src}/connection/udp`)

Test('DnsConnection', dnsConnectionTest => {
  let sandbox

  dnsConnectionTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(UdpConnection, 'createConnection')
    t.end()
  })

  dnsConnectionTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  dnsConnectionTest.test('createUdpConnection should', createUdpConnectionTest => {
    createUdpConnectionTest.test('create UDP server', test => {
      let opts = {}
      DnsConnection.createUdpConnection(opts)

      test.ok(UdpConnection.createConnection.calledOnce)
      test.ok(UdpConnection.createConnection.calledWith(opts))
      test.end()
    })

    createUdpConnectionTest.end()
  })

  dnsConnectionTest.end()
})
