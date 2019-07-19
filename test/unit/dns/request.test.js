'use strict'

const src = '../../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Packet = require('native-dns-packet')
const DnsRequest = require(`${src}/dns/request`)

Test('DnsRequest', dnsRequestTest => {
  let sandbox

  dnsRequestTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(Packet, 'write')
    t.end()
  })

  dnsRequestTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  dnsRequestTest.test('create should', createTest => {
    createTest.test('set header and question properties', test => {
      const question = { name: '7.6.5.4.3.2.1.5.5.5.1.e164enum.net', type: 35, class: 1 }

      const request = DnsRequest.create(question)

      test.ok(request.header.id)
      test.ok(request.header.id > 0 && request.header.id <= 65535)
      test.deepEqual(request.question, [question])
      test.end()
    })

    createTest.end()
  })

  dnsRequestTest.test('write should', writeTest => {
    writeTest.test('write request data to buffer', test => {
      const baseSize = 512
      const domain = '7.6.5.4.3.2.1.5.5.5.1.e164enum.net'
      const recordType = 35

      const request = DnsRequest.create(domain, recordType)

      const recordLength = 50
      Packet.write.returns(recordLength)

      const requestData = request.write(baseSize)

      test.ok(requestData)
      test.equal(requestData.length, recordLength)
      test.end()
    })

    writeTest.end()
  })

  dnsRequestTest.end()
})
