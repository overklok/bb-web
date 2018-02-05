/**
 * Класс для создания логируемых объектов
 *
 * Любой логируемый объект может работать в двух режимах:
 *      1) Логирование в консоль
 *      2) Логирование в буфер
 *
 * При логировании в консоль происходит стандартное перенаправление к стандартным функцям отладки console.*
 * При логировании в буфер стандартные функции отладки не вызываются; результаты сохраняются в буфер JSON-объектов,
 * содержимое которого можно получить с помощью метода getDebugBuffer()
 */
class Loggable {
    constructor(in_console = true) {
        this._debug_buffer = [];

        this._debug = {};

        if (in_console) {
            this._bindConsole();
        } else {
            this._bindBuffer();
        }
    }

    /**
     * Получить содержимое отладочного буфера
     *
     * @param   {Boolean} flush очистить ли буфер перед возвращением
     * @returns {Array}         буфер отладочных JSON-объектов
     */
    getDebugBuffer(flush = true) {
        if (flush) {
            let buf = this._debug_buffer;
            this._debug_buffer = [];

            return buf;
        }

        return this._debug_buffer;
    }

//private:

    /**
     * Привязать в качестве набора отладочных методов стандартные функции console.*
     *
     * @private
     */
    _bindConsole() {
        for (let cfn in window.console) {
            if (typeof console[cfn].bind !== "undefined") {
                this._debug[cfn] = window.console[cfn].bind(window.console, "[" + this.constructor.name + "]");
            }
        }
    }

    /**
     * Привязать в качестве набора отладочных методов функции логирования в буфер
     * Наименования отладочных методов аналогичны набору console.*
     *
     * @private
     */
    _bindBuffer() {
        for (let cfn in window.console) {
            this._debug[cfn] = () => {
                let debug_item = JSON.stringify(arguments);

                /// Запись в буфер
                this._debug_buffer.push({
                    module: this.constructor.name,
                    type:   cfn,
                    data:   debug_item
                });

                /// Стандартное логирование
                window.console[cfn]("[" + this.constructor.name + "]", arguments);
            }
        }
    }
}

export default Loggable;