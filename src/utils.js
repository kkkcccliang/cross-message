/**
 * Created by liangjz on 4/11/16.
 */

'use strict';


let _Q = typeof Promise === 'undefined' ? null : Promise;

export function isObject(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
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
