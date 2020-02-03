import TestApplication from "./TestApplication";
import { expect } from "chai";
import Application from "../Application";

describe('TestApplication', function() {
    let instance = new TestApplication();

    it('Should be inherited from Application', function() {
        expect(instance).to.be.instanceof(Application);
    })
});