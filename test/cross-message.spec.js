/**
 * Created by liangjz on 4/8/16.
 */

import {CrossMessage} from '../src/cross-message';

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
                        thisWindow: window,
                        knownWindowOnly: false // for test
                    });
                    crossMessage.on('crossEventWithTrue', function () { return true; });
                    crossMessage.on('crossEventWithFalse', function () { return false; });
                    crossMessage.on('crossEventWithAnyData', function () {
                        return 'OK';
                    });
                    crossMessage.on('crossEventWithPromiseResolved', function () {
                        return Promise.resolve('Promise resolved');
                    });
                    crossMessage.on('crossEventWithPromiseRejected', function () {
                        return Promise.reject('Promise rejected');
                    });
                    
                    crossMessage.on('testOffEvent', function (eventName) {
                        crossMessage.off(eventName);
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
        domain: '*',
        knownWindowOnly: false // for test
    });

    describe('Test post', () => {

        it('should resolve with true', (done) => {
            crossMessageParent.post('crossEventWithTrue').then((result) => {
                expect(result).toBe(true);
                done();
            });
        });

        it('should reject with false', (done) => {
            crossMessageParent.post('crossEventWithFalse').then(() => {}, (error) => {
                expect(error).toBe(false);
                done();
            })
        });

        it('should resolve with "OK"', (done) => {
            crossMessageParent.post('crossEventWithAnyData').then((result) => {
                expect(result).toEqual('OK');
                done();
            })
        });

        it('should resolve with "Promise resolved"', (done) => {
            crossMessageParent.post('crossEventWithPromiseResolved').then((result) => {
                expect(result).toEqual('Promise resolved');
                done();
            })
        });

        it('should reject with "Promise rejected"', (done) => {
            crossMessageParent.post('crossEventWithPromiseRejected').then(() => {}, (error) => {
                expect(error).toEqual('Promise rejected');
                done();
            })
        });

    });
});
