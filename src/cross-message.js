/**
 * Created by liangjz on 4/8/16.
 */


import {
    setPromise,
    getPromise,
    eventListener,
    isObject,
    isPromise,
    assign
} from './utils';

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
     * @param options
     *        .otherWindow     The window that we want to communicate with.
     *        .thisWindow       [optional] Default to current window that includes 'CrossMessage'
     *        .domain           [optional] Default '*'
     *        .knownWindowOnly  [optional] If true, receive event from 'otherWindow' only. Default to true
     */
    constructor(options = {}) {
        if (!getPromise()) {
            throw new Error('No "Promise" feature available in browser, must specify another promise lib');
        }

        if (!options.otherWindow) {
            throw new Error('Must specify "otherWindow" to communicate with');
        }

        options = assign(options, {thisWindow: window, domain: '*', knownWindowOnly: true});
        let thisWindow = options.thisWindow;
        let otherWin = this._otherWin = options.otherWindow;
        let knownWindowOnly = !!options.knownWindowOnly;
        this._domain = options.domain;
        this._callbacks = {};
        this._promises = {};

        addEventListener(thisWindow, 'message', (event) => {
            if (knownWindowOnly && otherWin !== event.source) {
                // Ignores the event doesn't belongs to this
                return;
            }

            if (!this._domain) {
                this._domain = event.origin || event.originalEvent.origin;
            }

            let eventData = event.data, matchRequest, matchResponse;
            if (matchRequest = eventData.$type.match(_requestReg)) {
                this._handleReq(event, eventData, matchRequest[1], matchRequest[2]);
            } else if (matchResponse = eventData.$type.match(_responseReg)) {
                this._handleResp(event, eventData, matchResponse[1], matchResponse[2]);
            }
        });
    }

    postEvent(event, data) {
        let defer = getPromise().defer();
        ++_uniqueId;

        this._otherWin.postMessage({
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

    _handleReq(event, eventData, id, eventName) {
        let cb = this._callbacks[eventName],
            result = typeof cb === 'function' ? cb(eventData.$data) : {
                status: REJECTED,
                message: `No specified callback of ${eventName}`
            },
            $type = `${id}${_responsePrefix}${eventName}`,
            win = event.source, d = this._domain;
        // The callback returns a promise
        if (isPromise(result)) {
            result.then((realResult) => {
                win.postMessage({$type: $type, $data: {status: RESOLVED, message: realResult}}, d);
            }, (error) => {
                win.postMessage({$type: $type, $data: {status: REJECTED, message: error}}, d)
            });
            return;
        }
        // The callback returns with true/false, or an object without 'status' property(treat it as resolved with this object)
        else if (!isObject(result) || !result.status) {
            result = {status: !!result ? RESOLVED : REJECTED, message: result}
        }
        win.postMessage({$type: $type, $data: result}, d);
    }

    _handleResp(event, eventData, id, eventName) {
        let $data = eventData.$data,
            method = $data.status.toLocaleLowerCase() === RESOLVED ? 'resolve' : 'reject',
            key = `${id}${eventName}`;
        this._promises[key][method](eventData.$data.message);
        delete this._promises[key];
    }
}

if (typeof window !== 'undefined') {
    window.CrossMessage = CrossMessage;
}
