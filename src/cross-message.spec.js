/**
 * Created by liangjz on 4/8/16.
 */

import {CrossMessage} from './cross-message';

describe('CrossMessage', () => {

    let frame, html;
    frame = document.createElement('iframe');
    frame.setAttribute('id', 'testFrame');
    html = `
        <html>
        <head>
            <script>
                function onLoad() {
                    // ES5 code here
                    var crossMessage = new CrossMessage({
                        otherWindow: window.parent,
                        thisWindow: window
                    });
                    crossMessage.onEvent('crossEventWithTrue', function () { return true; });
                    crossMessage.onEvent('crossEventWithFalse', function () { return false; });
                    crossMessage.onEvent('crossEventWithResolved', function () {
                        return {status: 'resolved', message: 'OK'};
                    });
                    crossMessage.onEvent('crossEventWithRejected', function () {
                        return {status: 'rejected', message: 'Fail'};
                    });
                    crossMessage.onEvent('crossEventWithPromiseResolved', function () {
                        var defer = Promise.defer();
                        defer.resolve('Promise resolved');
                        return defer.promise;
                    });
                    crossMessage.onEvent('crossEventWithPromiseRejected', function () {
                        var defer = Promise.defer();
                        defer.reject('Promise rejected');
                        return defer.promise;
                    });
                    
                    crossMessage.onEvent('testOffEvent', function (eventName) {
                        crossMessage.offEvent(eventName);
                        return true;
                    });
                }
            </script>
        </head>
        <body onload="onLoad();">
        </body>
        </html>
    `;
    document.body.appendChild(frame);
    frame.contentWindow.CrossMessage = CrossMessage;
    frame.contentDocument.open();
    frame.contentDocument.write(html);
    frame.contentDocument.close();

    let frameDoc = document.getElementById('testFrame');
    let crossMessageParent = new CrossMessage({
        otherWindow: frameDoc.contentWindow,
        thisWindow: window,
        domain: '*'
    });

    describe('Test postEvent', () => {

        it('should resolve with true', (done) => {
            crossMessageParent.postEvent('crossEventWithTrue').then((result) => {
                expect(result).toBe(true);
                done();
            });
        });

        it('should reject with false', (done) => {
            crossMessageParent.postEvent('crossEventWithFalse').then(() => {}, (error) => {
                expect(error).toBe(false);
                done();
            })
        });

        it('should resolve with "OK"', (done) => {
            crossMessageParent.postEvent('crossEventWithResolved').then((result) => {
                expect(result).toEqual('OK');
                done();
            })
        });

        it('should reject with "Fail"', (done) => {
            crossMessageParent.postEvent('crossEventWithRejected').then(() => {}, (error) => {
                expect(error).toEqual('Fail');
                done();
            })
        });

        it('should resolve with "Promise resolved"', (done) => {
            crossMessageParent.postEvent('crossEventWithPromiseResolved').then((result) => {
                expect(result).toEqual('Promise resolved');
                done();
            })
        });

        it('should reject with "Promise rejected"', (done) => {
            crossMessageParent.postEvent('crossEventWithPromiseRejected').then(() => {}, (error) => {
                expect(error).toEqual('Promise rejected');
                done();
            })
        });

        it('should reject after offEvent with "No callback"', (done) => {
            crossMessageParent.postEvent('testOffEvent', 'crossEventWithTrue').then(() => {
                return crossMessageParent.postEvent('crossEventWithTrue');
            }).then(() => {}, (error) => {
                expect(error).toEqual('No specified callback of crossEventWithTrue');
                done();
            })
        });

    });
});
