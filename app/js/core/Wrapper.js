import Loggable from './Loggable';

/**
 * Обёртки - зависимые компоненты модулей.
 * Обёртки могут существовать только в составе модулей (см. Module).
 * Обёртки не знают о существовании модулей и приложений.
 * Методы обёртки могут быть реализованы с помощью одной или нескольких библиотек схожего назначения.
 *
 * Задача обёртки - абстрагировать остальной код от конкретной библиотеки (набора бибилотек). Например:
 *      - GUI языка программирования Blockly
 *      - Сокет-клиент
 *      - Веб-клиент
 *      - Специфический визуальный компонент "гирлянда"
 *      - Система всплывающих окон
 *
 * Обёртка должна использовать класс Promise при необходимости выполнения синхронного кода.
 *
 * Классы-обёртки должны наследоваться от класса Wrapper.
 * Имена классов-обёрток именуются в стиле CamelCase с постфиксом Wrapper.
 * Каждый класс должен быть расположен в отдельном одноимённом файле.
 */
class Wrapper extends Loggable {
    constructor(options) {
        options = options || {};
        super(options);
    }
}

export default Wrapper;