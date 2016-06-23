# cross-message
A high level component of cross-document message with promise style.


## Install
- With npm: npm install cross-message --save
- With bower: bower install cross-message --save
- Include dist/cross-message.min.js in you index.html


## Usage
### Promise
```javascript
// 在不支持Promise的浏览器里, 需要引入外部的promise库, 例如q或angular的$q
CrossMessage.usePromise(SomePromise);
```

### Some document
```javascript
let crossMessage = new CrossMessage({otherWindow: theFrameWindow});
crossMessage.post('giveMeSomeResult', data).then((message) => {
    // ...
}, (message) => {
    // ...
});
```

### Another document
```javascript
//
let crossMessage = new CrossMessage({otherWindow: window.parent});
crossMessage.on('giveMeSomeResult', (data) => {
    // ...
    
    // 必须返回promise或者一个值.
    // - promise
    // - true/false, 相当于 Promise.resolve(true), Promise.reject(false)
    // - 任意值, 相当于 Promise.resolve(value)
    return Promise.resolve(xxx);
});
```

### Important
如果不是在全局作用域使用CrossMessage, 在作用域销毁之前需要调用crossMessage.clear(), 以取消所有的监听, 包括window的message本身的监听.
例如在一个SPA中, 在A子页面使用了CrossMessage, 在切换到其他页面之前(如果A子页面会被销毁), 需要调用此方法


## Test
- npm run test.
- gulp build, then open test/index.html, see the log in console.
