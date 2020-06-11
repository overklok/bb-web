import { expect } from "chai";

import {ILayoutPane, LayoutConfig} from "../LayoutConfig";
import {ConfigurationError} from "../../helpers/exceptions/configuration";

describe('LayoutConfiguration', function() {
    const lc = new LayoutConfig({});

    describe('validateSizes', function () {
        it('should throw an error if all sizes is not falsey', function () {
            const sizes = {panes: [{size: 1}, {size: 2}, {size: 'test'}, {size: 'test'}]};
            const fn = () => lc.preprocessPane(sizes as ILayoutPane);

            expect(fn).to.throw(ConfigurationError);
        });

        it('should throw an error if at least one of the sizes is falsey', function () {
            const sizes = {panes: [{size: 1}, {size: 2}, {size: 'test'}, {size: undefined}]};
            const fn = () => lc.preprocessPane(sizes as ILayoutPane);

            expect(fn).to.not.throw(ConfigurationError);
        });

        it('should not throw an error if all of the sizes are falsey', function () {
            const sizes = {panes: [{}, {}, {}, {}]};
            const fn = () => lc.preprocessPane(sizes as ILayoutPane);

            expect(fn).to.not.throw(ConfigurationError);
        });

        it('should throw an error for invalid recursive objects', function () {
            const sizes = {panes: [{size: 1}, {size: 2}, {size: 'test'}, {size: 0, panes: [
                {size: 1}, {size: 2}, {size: 'test'}, {size: 'test'}
            ]}]};
            const fn = () => lc.preprocessPane(sizes as ILayoutPane);

            expect(fn).to.throw(ConfigurationError);
        });

        it('should not throw an error for valid recursive objects', function () {
            const sizes = {panes: [{size: 1}, {size: 2}, {size: 'test'}, {size: 0, panes: [
                {size: 1}, {size: null}, {size: 'test'}, {size: 'test'}
            ]}]};
            const fn = () => lc.preprocessPane(sizes as ILayoutPane);

            expect(fn).to.not.throw(ConfigurationError);
        });
    });
});