'use strict'

const Query = require('../src')

const args = process.argv.slice(2)
if (args.length === 0) {
  console.log('You must enter a phone number to query!')
  process.exit(1)
}

const phoneNumber = args[0]

const client = Query.createClient({ address: '156.154.59.228' })
client.request(phoneNumber)
  .then(response => {
    console.log('RESPONSE MESSAGE')
    console.dir(response, { depth: null })
  })
  .catch(err => {
    console.log('ERROR')
    console.log(err)
  })
