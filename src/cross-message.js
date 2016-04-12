/**
 * Created by liangjz on 4/8/16.
 */


import {setPromise, getPromise, eventListener, isObject, isPromise} from './utils';

let {addEventListener, removeEventListener} = eventListener();
let _uniqueId = 0;
let _requestPrefix = '__request-';
let _responsePrefix = '__response-';
let _requestReg = new RegExp('^(\\d+)' + _requestPrefix + '(.*)');
let _responseReg = new RegExp('^(\\d+)' + _responsePrefix + '(.*)');
let RESOLVED = 'resolved';
let REJECTED = 'rejected';

export class CrossMessage {

    /**
     * Set the global promise to use. Default to 'Promise' in modern browsers
     * @param Q
     */
    static usePromise(Q) {
        setPromise(Q);
    }

    /**
     * Using window.postMessage magic. See https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
     * @param targetWindow A window object that we want to communicate with.
     * @param domain
     */
    constructor(targetWindow, domain = '*') {
        if (!getPromise()) {
            throw new Error('No "Promise" feature available in browser, must specify another promise lib');
        }

        this._sender = window; // Default to current 'window'
        this._receiver = targetWindow; // Window that receive message, can be determined after first event
        this._domain = domain;
        this._callbacks = {};
        this._promises = {};

        addEventListener(this._sender, 'message', (event) => {
            if (!this._receiver) {
                this._receiver = event.source;
            }
            if (!this._domain) {
                this._domain = event.origin || event.originalEvent.origin;
            }

            let eventData = event.data, matchRequest, matchResponse;
            if (matchRequest = eventData.$type.match(_requestReg)) {
                this._handleReq(eventData, matchRequest[1], matchRequest[2]);
            } else if (matchResponse = eventData.$type.match(_responseReg)) {
                this._handleResp(eventData, matchResponse[1], matchResponse[2]);
            }
        });
    }

    postEvent(event, data) {
        let defer = getPromise().defer();
        ++_uniqueId;

        this._receiver.postMessage({
            $type: `${_uniqueId}${_requestPrefix}${event}`,
            $data: data
        }, this._domain);

        return (this._promises[`${_uniqueId}${event}`] = defer).promise;
    }

    onEvent(event, fn) {
        this._callbacks[event] = fn;
    }

    offEvent(event, fn) {
        delete this._callbacks[event];
    }
    
    _handleReq(eventData, id, eventName) {
        let result = this._callbacks[eventName](eventData.$data),
            $type = `${id}${_responsePrefix}${eventName}`,
            r = this._receiver, d = this._domain;
        if (isPromise(result)) {
            result.then((realResult) => {
                r.postMessage({$type: $type, $data: {status: RESOLVED, message: realResult}}, d);
            }, (error) => {
                r.postMessage({$type: $type, $data: {status: REJECTED, message: error}}, d)
            });
            return;
        } else if (!isObject(result)) {
            result = {status: !!result ? RESOLVED : REJECTED, message: result}
        }
        r.postMessage({$type: $type, $data: result}, d);
    }
    
    _handleResp(eventData, id, eventName) {
        let $data = eventData.$data,
            method = $data.status.toLocaleLowerCase() === RESOLVED ? 'resolve' : 'reject',
            key = `${id}${eventName}`;
        this._promises[key][method](eventData.$data.message);
        delete this._promises[key];
    }
}
