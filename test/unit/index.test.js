'use strict'

const src = '../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Proxyquire = require('proxyquire')

Test('Index', indexTest => {
  let sandbox
  let clientSpy
  let Index

  indexTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()

    clientSpy = sandbox.spy()
    Index = Proxyquire(src, { './client': clientSpy })

    t.end()
  })

  indexTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  indexTest.test('createClient should', createClientTest => {
    createClientTest.test('create client with supplied options', test => {
      let opts = { address: 'localhost' }
      Index.createClient(opts)

      test.ok(clientSpy.calledWithNew())
      test.ok(clientSpy.calledWith(opts))
      test.end()
    })

    createClientTest.test('create client with empty options if not supplied', test => {
      Index.createClient()

      test.ok(clientSpy.calledWithNew())
      test.ok(clientSpy.calledWith({}))
      test.end()
    })

    createClientTest.end()
  })
  indexTest.end()
})
