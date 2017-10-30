'use strict'

const Util = require('util')
const Packet = require('native-dns-packet')

function Response () {
  Packet.call(this)
}
Util.inherits(Response, Packet)

Response.parse = Packet.parse

module.exports = Response
