/**
 * Created by liangjz on 4/11/16.
 */

'use strict';


let _Q = typeof Promise === 'undefined' ? null : Promise;

export function isObject(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
}

export function assign(obj) {
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

export function isPromise(obj) {
    return isObject(obj) && typeof obj.then === 'function';
}

export function setPromise(promise) {
    _Q = promise;
}

export function getPromise() {
    return _Q;
}

export function eventListener() {
    let standard = !!window.document.addEventListener;
    return  {
        addEventListener: standard ?
            (el, type, fn) => {el.addEventListener(type, fn, false);} :
            (el, type, fn) => {el.attachEvent(`on${type}`, fn);},
        removeEventListener: standard ?
            (el, type, fn) => {el.removeEventListener(type, fn, false);} :
            (el, type, fn) => {el.detachEvent(`on${type}`, fn);}
    }
}
