/**
 * Created by liangjz on 4/8/16.
 */

import {CrossMessage} from './cross-message';

describe('CrossMessage', () => {

    beforeEach(function() {
        spyOn(console, 'log');
    });

    it('tracks that the console has been call', () => {
        new CrossMessage();
        expect(console.log).toHaveBeenCalled();
    });
});
