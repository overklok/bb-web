import { expect } from "chai";

import {LayoutConfiguration} from "../LayoutConfiguration";
import {ConfigurationError} from "../../exceptions/configuration";

describe('LayoutConfiguration', function() {
    describe('validateSizes', function () {
        it('should throw an error if all sizes is not falsey', function () {
            const sizes = [{size: 1}, {size: 2}, {size: 'test'}, {size: 'test'}];
            const fn = () => LayoutConfiguration.validateSizes(sizes);

            expect(fn).to.throw(ConfigurationError);
        });

        it('should throw an error if at least one of the sizes is falsey', function () {
            const sizes = [{size: 1}, {size: 2}, {size: 'test'}, {size: undefined}];
            const fn = () => LayoutConfiguration.validateSizes(sizes);

            expect(fn).to.not.throw(ConfigurationError);
        });

        it('should not throw an error if all of the sizes are falsey', function () {
            const sizes = [{}, {}, {}, {}];
            const fn = () => LayoutConfiguration.validateSizes(sizes);

            expect(fn).to.not.throw(ConfigurationError);
        });

        it('should throw an error for invalid recursive objects', function () {
            const sizes = [{size: 1}, {size: 2}, {size: 'test'}, {size: 0, panes: [
                {size: 1}, {size: 2}, {size: 'test'}, {size: 'test'}
            ]}];
            const fn = () => LayoutConfiguration.validateSizes(sizes);

            expect(fn).to.throw(ConfigurationError);
        });

        it('should not throw an error for valid recursive objects', function () {
            const sizes = [{size: 1}, {size: 2}, {size: 'test'}, {size: 0, panes: [
                {size: 1}, {size: null}, {size: 'test'}, {size: 'test'}
            ]}];
            const fn = () => LayoutConfiguration.validateSizes(sizes);

            expect(fn).to.not.throw(ConfigurationError);
        });
    });
});