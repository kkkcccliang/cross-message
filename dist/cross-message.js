(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CrossMessage = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by liangjz on 4/8/16.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _utils = require('./utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _eventListener = (0, _utils.eventListener)();

var addEventListener = _eventListener.addEventListener;
var removeEventListener = _eventListener.removeEventListener;

var _uniqueId = 0;
var _requestPrefix = '__request-';
var _responsePrefix = '__response-';
var _requestReg = new RegExp('^(\\d+)' + _requestPrefix + '(.*)');
var _responseReg = new RegExp('^(\\d+)' + _responsePrefix + '(.*)');
var RESOLVED = 'resolved';
var REJECTED = 'rejected';
var _useQ = typeof Promise === 'function';
var _useDefer = false;

var CrossMessage = exports.CrossMessage = function () {
    _createClass(CrossMessage, null, [{
        key: 'usePromise',


        /**
         * 在不支持Promise的browser里, 需要设置一个第三方的promise
         * @param Q
         */
        value: function usePromise(Q) {
            (0, _utils.setPromise)(Q);
            _useQ = typeof Q === 'function';
            _useDefer = typeof Q.defer === 'function';
        }

        /**
         * Using window.postMessage magic. See https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
         * @param options
         *        .otherWindow      需要通讯的目标窗口对象.
         *        .thisWindow       [optional] 默认为引用CrossMessage脚本的当前窗口对象
         *        .domain           [optional] 默认为'*'
         *        .knownWindowOnly  [optional] 如果设置为true, 则只接收'otherWindow'发来的消息. 默认为true
         */

    }]);

    function CrossMessage() {
        var _this = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, CrossMessage);

        if (!(0, _utils.getPromise)()) {
            throw new Error('No "Promise" feature available in browser, must specify another promise lib');
        }

        if (!options.otherWindow) {
            throw new Error('Must specify "otherWindow" to communicate with');
        }

        options = (0, _utils.assign)({ thisWindow: window, domain: '*', knownWindowOnly: true }, options);
        var thisWindow = this._thisWin = options.thisWindow;
        var otherWin = this._otherWin = options.otherWindow;
        var knownWindowOnly = !!options.knownWindowOnly;
        this._domain = options.domain;
        this._callbacks = {};
        this._promises = {};

        addEventListener(thisWindow, 'message', this._listener = function (event) {
            if (knownWindowOnly && otherWin !== event.source) {
                // Ignores the event doesn't belongs to this
                return;
            }

            if (!_this._domain) {
                _this._domain = event.origin || event.originalEvent.origin;
            }

            var eventData = event.data,
                matchRequest = void 0,
                matchResponse = void 0;
            if (matchRequest = eventData.$type.match(_requestReg)) {
                _this._handleReq(event, eventData, matchRequest[1], matchRequest[2]);
            } else if (matchResponse = eventData.$type.match(_responseReg)) {
                _this._handleResp(event, eventData, matchResponse[1], matchResponse[2]);
            }
        });
    }

    /**
     * 向目标窗口'otherWindow'发送数据. 返回promise
     * @param event     Event name
     * @param data      String or object, 不能包含function
     * @returns {promise}
     *
     * promise返回的值格式为{status: xx, message: xx}
     */


    _createClass(CrossMessage, [{
        key: 'post',
        value: function post(event, data) {
            var _this2 = this;

            var Q = (0, _utils.getPromise)();
            var _post = function _post(resolve, reject) {
                ++_uniqueId;
                _this2._otherWin.postMessage({
                    $type: '' + _uniqueId + _requestPrefix + event,
                    $data: data
                }, _this2._domain);
                _this2._promises['' + _uniqueId + event] = {
                    resolve: resolve,
                    reject: reject
                };
            };

            if (_useQ) {
                return new Q(function (resolve, reject) {
                    _post(resolve, reject);
                });
            }

            if (_useDefer) {
                var defer = Q.defer();
                _post(defer.resolve, defer.reject);
                return defer.promise;
            }

            throw new Error('Unknown promise.');
        }

        /**
         * 注册一个监听事件回调. 同一个事件只允许设置一个回调.
         * 此回调函数会接收一个参数, 即'otherWindow'通过post发出的data
         * @param event
         * @param fn
         *
         * fn必须返回一个值, 可以是以下值之一. 其中status有三种状态: resolved, rejected, notFound.
         * notFound是rejected的一种, 用于A向B通讯时, B中没有相应的处理事件的情况
         * - 任意一个包含status属性并且没有function value的对象: {status: 'resolved', message: 'xxxx'}
         *   如果没包含status属性, 则相当于 {status: 'resolved', message: theObject}
         * - true/false, 相当于 {status: 'resolved', message: true}/{status: 'rejected', message: false}
         * - promise: 这个promise必须resolve或reject以上值之一
         */

    }, {
        key: 'on',
        value: function on(event, fn) {
            this._callbacks[event] = fn;
        }

        /**
         * 注销事件监听. 如果不传入event, 则全部注销
         * @param event
         */

    }, {
        key: 'off',
        value: function off(event) {
            event ? delete this._callbacks[event] : this._callbacks = {};
        }

        /**
         * **重要**.
         * 如果不是在全局作用域使用CrossMessage, 在作用域销毁之前需要调用此方法.
         * 例如在一个SPA中, 在A子页面使用了CrossMessage, 在切换到其他页面之前(如果A子页面会被销毁), 需要调用此方法
         */

    }, {
        key: 'clear',
        value: function clear() {
            removeEventListener(this._thisWin, 'message', this._listener);
        }
    }, {
        key: '_handleReq',
        value: function _handleReq(event, eventData, id, eventName) {
            var cb = this._callbacks[eventName];

            // 没有相应的回调, 不处理
            if (typeof cb !== 'function') {
                return;
            }

            var result = cb(eventData.$data),
                $type = '' + id + _responsePrefix + eventName,
                win = event.source,
                d = this._domain;
            // The callback returns a promise
            if ((0, _utils.isPromise)(result)) {
                result.then(function (realResult) {
                    win.postMessage({ $type: $type, $data: { status: RESOLVED, message: realResult } }, d);
                }, function (error) {
                    win.postMessage({ $type: $type, $data: { status: REJECTED, message: error } }, d);
                });
                return;
            }
            // The callback returns with true/false
            else if (typeof result === 'boolean') {
                    result = { status: result ? RESOLVED : REJECTED, message: result };
                }
                // Normal object.
                else {
                        var status = result.status;
                        result = typeof status === 'string' ? result : { status: RESOLVED, message: result };
                    }
            win.postMessage({ $type: $type, $data: result }, d);
        }
    }, {
        key: '_handleResp',
        value: function _handleResp(event, eventData, id, eventName) {
            var $data = eventData.$data,
                method = $data.status.toLowerCase() === RESOLVED ? 'resolve' : 'reject',
                key = '' + id + eventName;
            if (this._promises[key]) {
                this._promises[key][method]($data.message);
                delete this._promises[key];
            }
        }
    }]);

    return CrossMessage;
}();

if (typeof window !== 'undefined') {
    window.CrossMessage = CrossMessage;
}

},{"./utils":2}],2:[function(require,module,exports){
/**
 * Created by liangjz on 4/11/16.
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.isObject = isObject;
exports.assign = assign;
exports.isPromise = isPromise;
exports.setPromise = setPromise;
exports.getPromise = getPromise;
exports.eventListener = eventListener;
var _Q = typeof Promise === 'undefined' ? null : Promise;

function isObject(obj) {
    var type = typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
    return type === 'function' || type === 'object' && !!obj;
}

function assign(obj) {
    if (!isObject(obj)) {
        return obj;
    }

    if (typeof Object.assign === 'function') {
        return Object.assign.apply(null, arguments);
    }

    var source, prop, i, len;
    for (i = 1, len = arguments.length; i < len; i++) {
        source = arguments[i];
        for (prop in source) {
            if (Object.getOwnPropertyDescriptor && Object.defineProperty) {
                var propertyDescriptor = Object.getOwnPropertyDescriptor(source, prop);
                Object.defineProperty(obj, prop, propertyDescriptor);
            } else {
                obj[prop] = source[prop];
            }
        }
    }
    return obj;
}

function isPromise(obj) {
    return isObject(obj) && typeof obj.then === 'function';
}

function setPromise(promise) {
    _Q = promise;
}

function getPromise() {
    return _Q;
}

function eventListener() {
    var standard = !!window.document.addEventListener;
    return {
        addEventListener: standard ? function (el, type, fn) {
            el.addEventListener(type, fn, false);
        } : function (el, type, fn) {
            el.attachEvent('on' + type, fn);
        },
        removeEventListener: standard ? function (el, type, fn) {
            el.removeEventListener(type, fn, false);
        } : function (el, type, fn) {
            el.detachEvent('on' + type, fn);
        }
    };
}

},{}]},{},[1]);
