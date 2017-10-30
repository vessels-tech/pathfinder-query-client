'use strict'

const UdpConnection = require('./udp')

exports.createUdpConnection = (opts) => {
  return UdpConnection.createConnection(opts)
}
