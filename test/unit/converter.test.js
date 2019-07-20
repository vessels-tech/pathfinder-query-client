'use strict'

const Test = require('tape')
const Converter = require('../../src/converter')

Test('Converter', converterTest => {
  converterTest.test('convertE164ToEnumDomain should', convertE164Test => {
    convertE164Test.test('convert E.164 phone number to ENUM domain', test => {
      const enumSuffix = 'e164enum.net'
      const e164Phone = '+15551234567'
      const enumDomain = `7.6.5.4.3.2.1.5.5.5.1.${enumSuffix}`

      const converted = Converter.convertE164ToEnumDomain(e164Phone, enumSuffix)
      test.equal(converted, enumDomain)
      test.end()
    })

    convertE164Test.test('remove non-digits', test => {
      const enumSuffix = 'e164enum.net'
      const e164Phone = '+1-555-123-4567'
      const enumDomain = `7.6.5.4.3.2.1.5.5.5.1.${enumSuffix}`

      const converted = Converter.convertE164ToEnumDomain(e164Phone, enumSuffix)
      test.equal(converted, enumDomain)
      test.end()
    })

    convertE164Test.end()
  })

  converterTest.test('convertEnumDomainToE164 should', convertEnumTest => {
    convertEnumTest.test('convert ENUM domain to valid E.164 phone number with leading +', test => {
      const e164Phone = '+15551234567'
      const enumDomain = `7.6.5.4.3.2.1.5.5.5.1.e164enum.net`

      const converted = Converter.convertEnumDomainToE164(enumDomain)
      test.equal(converted, e164Phone)
      test.end()
    })

    convertEnumTest.end()
  })

  converterTest.end()
})
