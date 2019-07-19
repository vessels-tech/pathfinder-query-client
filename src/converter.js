'use strict'

const convertE164ToEnumDomain = (e164Phone, enumSuffix) => {
  const cleaned = e164Phone.replace(/[^\d]/g, '')
  const reversed = Array.from(cleaned).reverse()
  reversed.push(enumSuffix)
  return reversed.join('.')
}

const convertEnumDomainToE164 = (enumDomain) => {
  const split = enumDomain.split('.')
  const suffixPos = split.findIndex(s => s.length > 1 && isNaN(s))
  return '+' + split.slice(0, suffixPos).reverse().join('')
}

module.exports = {
  convertE164ToEnumDomain,
  convertEnumDomainToE164
}
