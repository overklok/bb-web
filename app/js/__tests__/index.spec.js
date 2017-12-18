import Application from '../index.js'

describe('App', function() {
    // подготовим переменные для использования
    let Instance = new Application();

    // формальная проверка на тип возвращаемой переменной
    it('Should be an function', function() {
        expect(Application).to.be.an('function');
    });

    // после применения new на функции конструкторе - получим объект
    it('Instance should be an object', function() {
        expect(Instance).to.be.an('object');
    });
});