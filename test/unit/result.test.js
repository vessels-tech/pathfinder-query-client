'use strict'

'use strict'

const src = '../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Converter = require(`${src}/converter`)
const Result = require(`${src}/result`)

Test('Result', resultTest => {
  let sandbox

  resultTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(Converter, 'convertEnumDomainToE164')
    t.end()
  })

  resultTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  const buildDnsResponse = (domain) => {
    return {
      question: [ {
        name: domain
      } ],
      answer: [ {
        name: domain,
        type: 35,
        class: 1,
        ttl: 900,
        order: 10,
        preference: 50,
        flags: 'u',
        service: 'E2U+pstn:tel',
        regexp: '!^(.*)$!tel:\\1;npdi;spn=51589;q_stat=002!',
        replacement: ''
      }]
    }
  }

  resultTest.test('fromDnsResponse should', dnsResponseTest => {
    dnsResponseTest.test('return supplied DNS response', test => {
      let domain = '7.6.5.4.3.2.1.5.5.5.1.e164enum.net'
      let e164Phone = '+15551234567'
      let dnsResponse = buildDnsResponse(domain)

      Converter.convertEnumDomainToE164.returns(e164Phone)

      let result = Result.fromDnsResponse(dnsResponse)

      test.equal(result.query, domain)
      test.ok(Converter.convertEnumDomainToE164.calledWith(domain))
      test.equal(result.tn, e164Phone)
      test.equal(result.records.length, dnsResponse.answer.length)
      test.equal(result.records[0].order, dnsResponse.answer[0].order)
      test.equal(result.records[0].preference, dnsResponse.answer[0].preference)
      test.equal(result.records[0].ttl, dnsResponse.answer[0].ttl)
      test.equal(result.records[0].service, dnsResponse.answer[0].service)
      test.deepEqual(result.records[0].regexp.pattern, RegExp('^(.*)$'))
      test.equal(result.records[0].regexp.replace, 'tel:$1;npdi;spn=51589;q_stat=002')
      test.equal(result.records[0].replacement, dnsResponse.answer[0].replacement)
      test.end()
    })

    dnsResponseTest.test('handle empty question field', test => {
      let dnsResponse = { question: [] }

      let result = Result.fromDnsResponse(dnsResponse)

      test.notOk(result.query)
      test.notOk(result.tn)
      test.end()
    })

    dnsResponseTest.test('handle missing question field', test => {
      let dnsResponse = { }

      let result = Result.fromDnsResponse(dnsResponse)

      test.notOk(result.query)
      test.notOk(result.tn)
      test.end()
    })

    dnsResponseTest.test('handle empty answer field', test => {
      let dnsResponse = { question: [], answer: [] }

      let result = Result.fromDnsResponse(dnsResponse)

      test.deepEqual(result.records, [])
      test.end()
    })

    dnsResponseTest.test('handle missing question field', test => {
      let dnsResponse = { }

      let result = Result.fromDnsResponse(dnsResponse)

      test.deepEqual(result.records, [])
      test.end()
    })

    dnsResponseTest.test('handle empty regexp field', test => {
      let domain = '7.6.5.4.3.2.1.5.5.5.1.e164enum.net'
      let dnsResponse = buildDnsResponse(domain)

      dnsResponse.answer[0].regexp = null

      let result = Result.fromDnsResponse(dnsResponse)

      test.ok(result.records[0].regexp)
      test.notOk(result.records[0].regexp.pattern)
      test.notOk(result.records[0].regexp.replace)
      test.end()
    })

    dnsResponseTest.test('handle regexp field missing data', test => {
      let domain = '7.6.5.4.3.2.1.5.5.5.1.e164enum.net'
      let dnsResponse = buildDnsResponse(domain)

      dnsResponse.answer[0].regexp = '!!'

      let result = Result.fromDnsResponse(dnsResponse)

      test.ok(result.records[0].regexp)
      test.notOk(result.records[0].regexp.pattern)
      test.notOk(result.records[0].regexp.replace)
      test.end()
    })

    dnsResponseTest.test('handle multiple capture groups in regexp', test => {
      let domain = '7.6.5.4.3.2.1.5.5.5.1.e164enum.net'
      let dnsResponse = buildDnsResponse(domain)

      let replace = 'tel:$1-$2;npdi;spn=51589;q_stat=002'
      dnsResponse.answer[0].regexp = '!^(.*)$!tel:\\1-\\2;npdi;spn=51589;q_stat=002!'

      let result = Result.fromDnsResponse(dnsResponse)

      test.ok(result.records[0].regexp)
      test.equal(result.records[0].regexp.replace, replace)
      test.end()
    })

    dnsResponseTest.end()
  })

  resultTest.end()
})
