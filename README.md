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
    
    // 必须返回一个值, 可以是以下值之一. 其中status有三种状态: resolved, rejected, notFound.
    // notFound是rejected的一种, 用于A向B通讯时, B中没有相应的处理事件的情况
    // - 任意一个包含status属性并且没有function value的对象: {status: 'resolved', message: 'xxxx'}
    //   如果没包含status属性, 则相当于 {status: 'resolved', message: theObject}
    // - true/false, 相当于 {status: 'resolved', message: true}/{status: 'rejected', message: false}
    // - promise: 这个promise必须resolve或reject以上值之一
    return {status: 'resolved', message: someMessage}
});
```

### Important
如果不是在全局作用域使用CrossMessage, 在作用域销毁之前需要调用crossMessage.clear(), 以取消所有的监听, 包括window的message本身的监听.
例如在一个SPA中, 在A子页面使用了CrossMessage, 在切换到其他页面之前(如果A子页面会被销毁), 需要调用此方法


## Test
- npm run test.
- gulp build, then open test/index.html, see the log in console.
