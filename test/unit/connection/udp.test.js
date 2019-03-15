'use strict'

const src = '../../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Dgram = require('dgram')
const EventEmitter = require('events').EventEmitter
const Errors = require(`${src}/errors`)
const UdpConnection = require(`${src}/connection/udp`)

Test('UdpConnection', udpConnectionTest => {
  let clock
  let sandbox
  let emptyData = Buffer.alloc(0)

  udpConnectionTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(Dgram, 'createSocket')
    clock = Sinon.useFakeTimers()
    t.end()
  })

  udpConnectionTest.afterEach(t => {
    sandbox.restore()
    clock.restore()
    t.end()
  })

  udpConnectionTest.test('createConnection should', createConnectionTest => {
    createConnectionTest.test('create connection using provided options', test => {
      let opts = { address: 'test.com', port: 3000, timeout: 3000 }

      let conn = UdpConnection.createConnection(opts)

      test.equal(conn._address, opts.address)
      test.equal(conn._port, opts.port)
      test.equal(conn._timeout, opts.timeout)
      test.end()
    })

    createConnectionTest.end()
  })

  udpConnectionTest.test('getBaseSize should', createConnectionTest => {
    createConnectionTest.test('return base packet size', test => {
      let opts = { address: 'test.com', port: 3000, timeout: 3000 }

      let conn = UdpConnection.createConnection(opts)
      let udpBaseSize = conn.getBaseSize()

      test.equal(udpBaseSize, 512)
      test.end()
    })

    createConnectionTest.end()
  })

  udpConnectionTest.test('send should', sendTest => {
    sendTest.test('create UDP socket and bind', test => {
      let opts = { address: 'test.com', port: 3000, timeout: 3000 }

      let conn = UdpConnection.createConnection(opts)

      let udpSocket = new EventEmitter()
      udpSocket.bind = sandbox.spy()

      Dgram.createSocket.returns(udpSocket)

      conn.send(emptyData)

      test.ok(Dgram.createSocket.calledWith('udp4'))
      test.ok(udpSocket.bind.calledOnce)
      test.end()
    })

    sendTest.test('send DNS request on UDP socket listening event', test => {
      let opts = { address: 'test.com', port: 3000, timeout: 3000 }

      let conn = UdpConnection.createConnection(opts)

      let requestData = Buffer.alloc(50)

      let udpSocket = new EventEmitter()
      udpSocket.bind = sandbox.spy()
      udpSocket.send = sandbox.stub()

      Dgram.createSocket.returns(udpSocket)

      conn.send(requestData)

      udpSocket.emit('listening')

      test.ok(udpSocket.send.calledWith(requestData, 0, requestData.length, opts.port, opts.address))
      test.end()
    })

    sendTest.test('reject promise on socket timeout', test => {
      let opts = { address: 'test.com', port: 3000, timeout: 3000 }

      let conn = UdpConnection.createConnection(opts)

      let requestData = Buffer.alloc(50)

      let udpSocket = new EventEmitter()
      udpSocket.bind = sandbox.spy()
      udpSocket.send = sandbox.stub()
      udpSocket.close = sandbox.spy()

      Dgram.createSocket.returns(udpSocket)

      let sendPromise = conn.send(requestData)

      udpSocket.emit('listening')

      clock.tick(opts.timeout + 1)

      sendPromise
        .then(() => {
          test.fail('Should have thrown error')
          test.end()
        })
        .catch(Errors.RequestTimeoutError, err => {
          test.equal(err.message, `Request timed out after ${opts.timeout} milliseconds`)
          test.ok(udpSocket.close.calledOnce)
          test.end()
        })
        .catch(e => {
          test.fail('Expected RequestTimeoutError')
          test.end()
        })
    })

    sendTest.test('reject promise on UDP socket error event', test => {
      let opts = { address: 'test.com', port: 3000, timeout: 3000 }

      let conn = UdpConnection.createConnection(opts)

      let udpSocket = new EventEmitter()
      udpSocket.bind = sandbox.spy()
      udpSocket.close = sandbox.spy()

      Dgram.createSocket.returns(udpSocket)

      let sendPromise = conn.send(emptyData)

      let socketError = new Error('Bad socket stuff')
      udpSocket.emit('error', socketError)

      sendPromise
        .then(() => {
          test.fail('Should have thrown error')
          test.end()
        })
        .catch(err => {
          test.equal(err, socketError)
          test.ok(udpSocket.close.calledOnce)
          test.end()
        })
    })

    sendTest.test('fulfill promise on UDP message event', test => {
      let opts = { address: 'test.com', port: 3000, timeout: 3000 }

      let conn = UdpConnection.createConnection(opts)

      let udpSocket = new EventEmitter()
      udpSocket.bind = sandbox.spy()
      udpSocket.close = sandbox.spy()

      Dgram.createSocket.returns(udpSocket)

      let sendPromise = conn.send(emptyData)

      let socketMessage = 'data'
      let socketRemote = {}
      udpSocket.emit('message', socketMessage, socketRemote)

      sendPromise
        .then(response => {
          test.equal(response, socketMessage)
          test.ok(udpSocket.close.calledOnce)
          test.end()
        })
    })

    sendTest.end()
  })

  udpConnectionTest.end()
})
