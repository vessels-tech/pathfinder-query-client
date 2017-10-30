# pathfinder-query-client

A library used to query PathFinder by E.164 telephone number and retrieve records provisioned for that number.

## Installation
You must have setup connection to the @leveloneproject npm repo on JFrog in order to install.
> npm install @leveloneproject/pathfinder-query-client

## Usage
```
const Query = require('@leveloneproject/pathfinder-query-client')

const phoneNumber = '+15714344668'

const client = Query.createClient({ address: '156.154.59.228' })

client.request(phoneNumber)
  .then(response => {
    console.log('RESPONSE MESSAGE')
    console.log(response)
  })
  .catch(err => {
    console.log('ERROR')
    console.log(err)
  })
 ```

## API

### Class: Client

This class represents a client to query PathFinder.

#### createClient(options)

- `options` {Object}
  - `address` {String} The hostname or IP address of the PathFinder server. Defaults to 'localhost'.
  - `port` {Number} The port of the PathFinder server. Defaults to 53.
  - `type` {String} The connection type to use when connecting to PathFinder ('udp'). Defaults to 'udp'.
  - `timeout` {Number} The timeout used when querying PathFinder, in milliseconds. Defaults to 5000.
  - `enumSuffix` {String} The suffix to append to the [ENUM](https://www.voip-info.org/wiki/view/ENUM) query sent to PathFinder. Defaults to 'e164enum.net'.
  
Creates a new query client.

This method can also throw a variety of `Error` types that should be handled.

- `InvalidConnectionTypeError` Thrown if the `type` parameter is not 'udp'.

#### client.request(phoneNumber)

- `phoneNumber` {String} The [E.164](https://en.wikipedia.org/wiki/E.164) formatted phone number to query. The + sign at the beginning of the number is optional.
- Returns: {Array}

Returns an array of `Result` objects.

This method can also throw a variety of `Error` types that should be handled.

- `RequestTimeoutError` Thrown if the request is not completed within the `timeout` value used when creating the client.
- `QueryFormatError` Thrown if the query format is not recognized by PathFinder. Corresponds to an rcode value of 1 in the DNS response header.
- `ServerFailError` Thrown if unable to process the query due to a problem with PathFinder server. Corresponds to an rcode value of 2 in the DNS response header.
- `InvalidPhoneFormatError` Thrown if the telephone number being requested is not in a valid E.164 format.
- `InvalidPhoneNumberError` Thrown if the telephone number is not valid as determined by PathFinder. Corresponds to an rcode value of 3 in the DNS response header.
- `UnauthorizedError` Thrown if the source IP is not authorized to access PathFinder. Corresponds to an rcode value of 5 in the DNS response header.
- `UnhandledRcodeError` Thrown if the rcode returned from PathFinder is not recognized by this client.

### Class: Result

This class represents a result returned from PathFinder for a query.

New instances of `Result` are returned from Client.request(). The new keyword is not to be used to create `Result` instances.

#### result.tn

- {String}

The [E.164](https://en.wikipedia.org/wiki/E.164) phone number that was queried.

#### result.query

- {String} 

The query that was sent to PathFinder for this result.

#### result.records

- {Array}
	- {Object}
		- `order` {Number} A request from the holder of the telephone number that specifies the order in which records must be processed when multiple records are returned for the same TN. Lower values have priority.
		- `preference` {Number} A suggestion from the holder of the TN that one record is better to use than another when multiple NAPTR records show the same value for order. Lower values have priority.
		- `ttl` {Number} The time interval in seconds that the record may be stored or cached.
		- `service` {String} A character string that specifies the resolution protocol and resolution service(s) that will be available if the rewrite specified by the regexp fields is applied.
		- `regexp` {Object} An object containing the rewrite rule. It is applied to the original query string to construct the domain name.
			- `pattern` {RegExp} The pattern to apply to the E.164 phone number. Example: `'+15551234567'.replace(regex.pattern, replace)`
			- `replace` {String} The replacement string to use when using the pattern against the E.164 phone number.
		- `replacement` {String} Another field that may be used for the rewrite rule. An empty string indicates there is no other rewrite rule.

An array of records that were returned for the query.
