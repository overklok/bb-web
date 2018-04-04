import Breadboard from "../Breadboard";

describe('Breadboard', function() {
    // подготовим переменные для использования
    let Instance = new Breadboard();

    // формальная проверка на тип возвращаемой переменной
    it("Should be an function", function () {
        expect(Breadboard).to.be.an('function');
    });

    // после применения new на функции конструкторе - получим объект
    it("Instance should be an object", function() {
        expect(Instance).to.be.an('object');
    });
});