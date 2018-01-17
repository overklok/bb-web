import Dispatcher from '../Dispatcher.js'
import SimpleModule from "./_SimpleModule";

let spies = require('chai-spies');
chai.use(spies);

describe('Dispatcher', function() {
    // подготовим переменные для использования
    let Instance = new Dispatcher();

    // формальная проверка на тип возвращаемой переменной
    it('Should be an function', function() {
        expect(Dispatcher).to.be.an('function');
    });

    // после применения new на функции конструкторе - получим объект
    it('Instance should be an object', function() {
        expect(Instance).to.be.an('object');
    });

    describe("#_getHandler()", function() {
        /**
         * Если событие включено в список прослушиваемых, возвращаемая функция вызывает его обработчик
         */
       it("Should cause the returned function to call the surrogate event handler if it was included in the list");

        /**
         * Если события нет в списке прослушиваемых, возвращаемая функция выводит предупреждение
         */
       it("Should return a function that throws an exception with an error message if the argument is incorrect");

        /**
         * При неправильном типе аргумента возвращаемая функция выбрасывает исключение с сообщением об ошибке
         */
       it("Should return a function that prints a warning if event is not in the list");

    });

    describe("#subscribe()", function() {
        /**
         * Тип события добавляется в список прослушиваемых типов событий
         */
        it("Should add all module event types to currently listening event types", function() {
            let disp    = new Dispatcher();
            let module  = new SimpleModule();

            disp.subscribe(module);

            let currently_listening_ets = [...disp._event_types];

            expect(currently_listening_ets).to.deep.equal(["sim:et0", "sim:et1"]);
        });

        /**
         * Обработчики событий модуля должны вызывать метод, вызывающий локальный обработчик соответствующего
         * суррогатного события
         *
         * Этот тест затрагивает функциональность метода #on(), для которого есть отдельный набор тестов
         */
        it("Should make all module event listeners call a method which calls a handler of surrogate event", function() {
            let disp    = new Dispatcher();
            let module  = new SimpleModule();

            let spy = chai.spy();

            disp.subscribe(module);

            disp.all();

            disp.on("sim:et0", spy);

            module.emitEvent("et0");

            expect(spy).to.have.been.called();

        });
    });

    describe("#on()", function() {
        /**
         * Выбрасывает исключения при неверных аргументах
         */
        it("Should throw a corresponding exception if at least one of arguments is not correct");

        /**
         * Словарь обработчиков дополняется данным обработчиком с данным именем события
         */
        it("Should append a given handler with given event name to the handlers dictionary");

        /**
         * При вызове функции с тем же именем события, но с другим обработчиком происходит переопределение
         */
        it("Should override an older handler with given handler with the same event name in the handlers dictionary");
    });

    describe("#always()", function() {
        /**
         * Выбрасывает исключение, если аргумент не является массивом
         */
        it("Should throw a corresponding exception if the argument is not an array", function () {
            let disp    = new Dispatcher();

            (function() {disp.always('Not an array')}).should.throw();
            (function() {disp.always(1234567890)}).should.throw();
            (function() {disp.always({})}).should.throw();
        });

        /**
         * Заданный массив преобразуется в развёрнутое подмножество событий, сохраняющееся в параметрах объекта
         */
        it("Should save the specified array to the object's parameters", function() {
            let disp    = new Dispatcher();
            let module  = new SimpleModule();

            disp.subscribe(module);

            let eventspace =            ['module:event1', 'module:event2'];
            let event_types_expected =  ['module:event1', 'module:event2'];

            disp.always(eventspace);

            let event_types_after = disp._event_types_listening;

            expect(eventspace).to.deep.equal(event_types_expected);
        });
    });

    describe("#all()", function() {
        it("Should replace all currently listening event types to all possible event types", function() {
            let disp    = new Dispatcher();
            let module  = new SimpleModule();

            disp.subscribe(module);

            let all = [...disp._event_types];

            disp.all();

            let listening_after_all = [...disp._event_types_listening.current];

            expect(listening_after_all).to.deep.equal(all);
        });
    });

    /**
     *  Возвращаемая функция должна оставлять в фильтрующемся массиве только те элементы,
     *  которые заданы с помощью строк, составленных по правилам, перечисленным выше,
     *  в заданном массиве масок
     */
    describe("#getFilterByEventspace()", function () {
        it("Should return a function that filters an array using given array of masks by specified rules", function() {
            let disp    = new Dispatcher();

            let base        = ['module1:event1', 'module1:event2', 'module2:event1', 'module2:event2'];

            let masks       = ['module1:*', 'module2:event1', 'nomodule:noevent'];
            let expected    = ['module1:event1', 'module1:event2', 'module2:event1'];

            let result = base.filter(Dispatcher.getFilterByEventspace(masks));

            expect(result).to.deep.equal(expected);

            masks       = ['module2:event2', '*'];
            expected    = base;

            result = base.filter(Dispatcher.getFilterByEventspace(masks));

            expect(result).to.deep.equal(expected);

            masks       = ['*'];
            expected    = base;

            result = base.filter(Dispatcher.getFilterByEventspace(masks));

            expect(result).to.deep.equal(expected);
        });
    });
});