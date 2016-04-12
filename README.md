# cross-message
An extremely simple cross-document message implement, using promise style.


## Install
- With npm: npm install cross-message --save
- With bower: bower install cross-message --save
- Or just include dist/cross-message.min.js in you index.html


## Usage
### Promise
```javascript
// Within the browser that doesn't support Promise, set the external promise lib.
CrossMessage.usePromise($q); // angular's $q, or jQuery's deferred for example
```

### Some document
```javascript
let crossMessage = new CrossMessage(aFrameWindow);
crossMessage.postEvent('giveMeSomeResult', data).then((result) => {
    // ...
    return 
}, (error) => {
    // ...
});
```

### Another document
```javascript
//
let crossMessage = new CrossMessage();
crossMessage.onEvent('giveMeSomeResult', (data) => {
    // ...
    
    // Simply return true for success or false for error.
    // Or return an object with 'status' and 'message', the value of 'status' must be 'resolved' or 'rejected'.
    // Or return a promise, resolve payload or reject error
    // return true;
    // return anotherPromise;
    return {status: 'resolved', message: someMessage}
});
```
