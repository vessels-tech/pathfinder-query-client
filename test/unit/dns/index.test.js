'use strict'

const src = '../../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Consts = require('native-dns-packet').consts
const Dns = require(`${src}/dns`)

Test('Dns', (dnsTest) => {
  let sandbox

  dnsTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    t.end()
  })

  dnsTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  dnsTest.test('exporting should', (exportingTest) => {
    exportingTest.test('export all supported DNS record types', (assert) => {
      assert.ok(Dns.NAPTR)
      assert.equal(Dns.NAPTR.value, Consts.nameToQtype('NAPTR'))
      assert.end()
    })

    exportingTest.end()
  })

  dnsTest.test('create record type from options', (createTest) => {
    createTest.test('assign default properties if none provided', (assert) => {
      let record = Dns.NAPTR()
      assert.ok(record)
      assert.equal(record.type, Consts.nameToQtype('NAPTR'))
      assert.equal(record.class, Consts.NAME_TO_QCLASS.IN)
      assert.end()
    })

    createTest.test('assign additional properties to created record', (assert) => {
      let name = 'name'
      let address = '127.0.0.2'
      let ttl = 600

      let record = Dns.NAPTR({ name: name, address: address, ttl: ttl })
      assert.ok(record)
      assert.equal(record.type, Consts.nameToQtype('NAPTR'))
      assert.equal(record.class, Consts.NAME_TO_QCLASS.IN)
      assert.equal(record.name, name)
      assert.equal(record.address, address)
      assert.equal(record.ttl, ttl)
      assert.end()
    })

    createTest.test('ignore default properties if passed in', (assert) => {
      let name = 'name'
      let type = 'type'

      let record = Dns.NAPTR({ name: name, type: type })
      assert.ok(record)
      assert.equal(record.class, Consts.NAME_TO_QCLASS.IN)
      assert.equal(record.name, name)
      assert.notEqual(record.type, type)
      assert.end()
    })

    createTest.end()
  })

  dnsTest.end()
})
