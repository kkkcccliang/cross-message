# cross-message
A high level component of cross-document message with promise style.


## Install
- With npm: npm install cross-message --save
- With bower: bower install cross-message --save
- Or just include dist/cross-message.min.js in you index.html


## Usage
### Promise
```javascript
// Within the browser that doesn't support Promise, set the external promise lib.
CrossMessage.usePromise(SomePromise);
```

### Some document
```javascript
let crossMessage = new CrossMessage({otherWindow: theFrameWindow});
crossMessage.post('giveMeSomeResult', data).then((result) => {
    // ...
}, (error) => {
    // ...
});
```

### Another document
```javascript
//
let crossMessage = new CrossMessage({otherWindow: window.parent});
crossMessage.on('giveMeSomeResult', (data) => {
    // ...
    
    // Simply return true for success or false for error.
    // Or return an object with 'status' and 'message', the value of 'status' must be 'resolved' or 'rejected'.
    // Or return a promise, resolve payload or reject error
    // return true;
    // return anotherPromise;
    return {status: 'resolved', message: someMessage}
});
```

## Test
- npm run test.
- gulp build, then open test/index.html, see the log in console.
