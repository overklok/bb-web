import { expect } from "chai";

import TestApplication from "./dummy/TestApplication";
import Application from "../Application";

describe('TestApplication', function() {
    let instance = new TestApplication();

    it('Should be inherited from Application', function() {
        expect(instance).to.be.instanceof(Application);
    });

    it('Should instantiate TestServiceProvider', function() {
        expect(instance)
    })
});