import Application from '../index.js'
import Dispatcher from "../core/Dispatcher";
import LocalServiceModule from "../modules/LocalServiceModule";

describe('App', function() {
    // подготовим переменные для использования
    let Instance = new Application();

    // формальная проверка на тип возвращаемой переменной
    it("Should be an function", function() {
        expect(Application).to.be.an('function');
    });

    // после применения new на функции конструкторе - получим объект
    it("Instance should be an object", function() {
        expect(Instance).to.be.an('object');
    });

    it("Should create an its own dispatcher", function() {
        expect(Instance._dispatcher).to.be.an.instanceof(Dispatcher);
    });

    it("Should create some modules", function() {
        // expect(Instance.ls).to.be.an.instanceof(LocalServiceModule);
    });
});
