'use strict'

const Converter = require('./converter')

class Result {
  constructor (dnsResponse) {
    this.tn = null
    this.query = null
    this.records = []

    this._parseDnsResponse(dnsResponse)
  }

  _parseDnsResponse (dnsResponse) {
    this.query = dnsResponse.question && dnsResponse.question.length > 0 ? dnsResponse.question[0].name : null

    if (this.query) {
      this.tn = Converter.convertEnumDomainToE164(this.query)
    }

    if (dnsResponse.answer) {
      this.records = dnsResponse.answer.map(this._parseAnswer.bind(this))
    }
  }

  _parseAnswer (answer) {
    return {
      order: answer.order,
      preference: answer.preference,
      ttl: answer.ttl,
      service: answer.service,
      regexp: this._parseRegexp(answer.regexp),
      replacement: answer.replacement
    }
  }

  _parseRegexp (regexp) {
    let parsed = { pattern: null, replace: null }
    if (regexp) {
      const separator = regexp[0]
      const split = regexp.substring(1, regexp.length - 1).split(separator)
      parsed.pattern = split.length >= 2 ? RegExp(split[0]) : null
      parsed.replace = split.length >= 2 ? split[1].replace(/\\(\d)/g, '$$$1') : null
    }
    return parsed
  }
}

exports.fromDnsResponse = (dnsResponse) => {
  return new Result(dnsResponse)
}
