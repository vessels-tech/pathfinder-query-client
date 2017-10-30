'use strict'

const Util = require('util')
const Packet = require('native-dns-packet')

function Request (question) {
  Packet.call(this)
  this.header.id = Request.generateId()
  this.question.push(question)
}
Util.inherits(Request, Packet)

Request.generateId = () => {
  return (Math.round(Math.random() * 65535))
}

Request.prototype.write = function (bufferSize) {
  const buff = Buffer.alloc(bufferSize)
  const len = Packet.write(buff, this)
  return buff.slice(0, len)
}

exports.create = (question) => {
  return new Request(question)
}
