'use strict'

const P = require('bluebird')
const Dgram = require('dgram')
const Errors = require('../errors')

class UdpConnection {
  constructor (opts) {
    this._address = opts.address
    this._port = opts.port
    this._timeout = opts.timeout
  }

  getBaseSize () {
    return 512
  }

  send (data) {
    return new P((resolve, reject) => {
      let timer = null

      const socket = Dgram.createSocket('udp4')

      socket.on('message', (msg, remote) => {
        clearTimeout(timer)
        resolve(msg)
        socket.close()
      })

      socket.on('error', (err) => {
        clearTimeout(timer)
        reject(err)
        socket.close()
      })

      socket.on('listening', () => {
        timer = setTimeout(() => {
          reject(new Errors.RequestTimeoutError(this._timeout))
          socket.close()
        }, this._timeout)

        socket.send(data, 0, data.length, this._port, this._address)
      })

      socket.bind()
    })
  }
}

exports.createConnection = function (opts) {
  return new UdpConnection(opts)
}
