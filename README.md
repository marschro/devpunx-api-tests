# ABOUT
Simple api-test module for node.js

# INSTALL
```bash
npm install devpunx-api-tests
```
# USE
* Define tests in a json5 file
* Integrate it in your code or use as standalone

## Test definitions
* protocol: **String** [http | https]
* host: **String** [hostname]
* port: **Number** [port] default: port is defined by protocoll [80 | 443]
* UseBasicAuth: **Object**
    * username: **String**
    * password: **String** default = false
* tests: **Object**
    * name: **String**
    * path: **String**
    * parameter: **Array**
    * method: **String** [GET|POST|PUT|DELETE]
    * expected: **Object**
        * statusCode: **Number**   


Example:
```json
{
    protocol: 'https',
    host: 'api.icndb.com',
    port: null,
    UseBasicAuth: false,
    tests: {
        "1": {
            name: 'GET /jokes/random',
            path: '/jokes/random',
            parameter: [],
            method: 'GET',
            expected: {
                statusCode: 200
            }
        },
        "2": {
            name: 'GET /asd',
            path: '/asd',
            parameter: ['api_key=mysecret'],
            method: 'GET',
            expected: {
                statusCode: 200
            }
        }
    }
}
```


Setup and run the tests with the path to test-definition file
```javascript
// Create new Test
let myTests = new Test([pathname to test-definition file])
// Run the tests
myTests.run()
```

## Example
```javascript
const Test = require('devpunx-api-tests')

let myTest = new Test(__dirname + '/tests').run()
```

Test results are shown in the console as table.
