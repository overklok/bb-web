import { expect } from "chai";

import Application from "../Application";
import IEventService from "../service/interfaces/IEventService";
import EventService from "../service/EventService";
import ILayoutService from "../service/interfaces/ILayoutService";
import LayoutService from "../service/LayoutService";
import IConfigService from "../service/interfaces/IConfigService";
import ConfigService from "../service/ConfigService";
import TestApplication from "./TestApplication";

describe('TestApplication', function() {
    let application = new TestApplication();

    it('Should be inherited from Application', function() {
        expect(application).to.be.instanceof(Application);
    });

    it('Should instantiate TestServiceProvider', function() {
        console.log(application.instance('test'));

        expect(application.instance('test')).to.be.a('string');
    });

    it('Should instantiate ConfigServiceProvider', function() {
        expect(application.instance(IConfigService)).to.be.an.instanceof(ConfigService);
    });

    it('Should instantiate EventServiceProvider', function() {
        expect(application.instance(IEventService)).to.be.an.instanceof(EventService);
    });

    it('Should instantiate LayoutServiceProvider', function() {
        expect(application.instance(ILayoutService)).to.be.an.instanceof(LayoutService);
    });

    let elem = document.createElement('div');
    elem.setAttribute('id', 'app');
    document.body.appendChild(elem);
    application.run(document.getElementById('app'));
});