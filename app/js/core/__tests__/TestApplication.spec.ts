import { expect } from "chai";

import TestApplication from "./dummy/TestApplication";
import Application from "../Application";
import IEventService from "../service/IEventService";
import RealEventService from "../service/RealEventService";

describe('TestApplication', function() {
    let application = new TestApplication();

    it('Should be inherited from Application', function() {
        expect(application).to.be.instanceof(Application);
    });

    it('Should instantiate TestServiceProvider', function() {
        console.log(application.instance('test'));

        expect(application.instance('test')).to.be.a('string');
    });

    it('Should instantiate EventServiceProvider', function() {
        expect(application.instance(IEventService)).to.be.an.instanceof(RealEventService);

        const inst = application.instance(IEventService);

        console.log(inst.foo);

        // inst.foo();
    });
});