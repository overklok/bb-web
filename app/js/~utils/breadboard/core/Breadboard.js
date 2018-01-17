import Grid from './Grid';

import SVG from 'svgjs'

const WS_WIDTH = 1000;              // Ширина рабочей области
const WS_HEIGHT = 900;              // Высота рабочей области

const GRID_WIDTH = 700;             // Ширина сетки точек
const GRID_HEIGHT = 600;            // Высота сетки точек

const WRAP_MARGIN = 50;             // Отступ обёртки
const GRID_MARGIN = 50;             // Отступ сетки

const GRID_ROWS = 7;                // Количество рядов в сетке точек
const GRID_COLS = 7;                // Количество колонок в сетке точек

const LABELS_FONT_SIZE = 12;        // Кегль подписей

const LABEL_LEFT_LAST_PRE = "-";    // Текст предпоследней текстовой метки слева
const LABEL_LEFT_LAST = "+";        // Текст последней текстовой метки слева

/**
 * Класс, отвечающий за разметку рабочей среды
 *
 * Управляет контейнерами и их содержимым.
 * SVG-контейнеры хранятся в this.containers:
 *
 *  -wrap               Основная обёртка. За её пределы ничего не может выходить
 *  -grid               Сетка точек
 *  -label_panes.left   Левая панель подписей для сетки точек
 *  -label_panes.right  Правая панель подписей для сетки точек
 *
 * @constructor
 * @class
 */
class Breadboard {
    constructor() {
        // Контейнеры, перечисленные выше
        // Объект заполняется функцией _initContainers()
        this.containers = {};

        if (!SVG.supported) {
            alert("SVG in not supported. Please use any modern browser.");
        }
    }

    /**
     * Привести рабочую среду в исходное состояние,
     * которое видит пользователь при загрузке страницы
     *
     * Запускать в $(document).ready()
     */
    start() {
        // Базовая кисть
        this.brush = SVG('workspace').size(WS_WIDTH, WS_HEIGHT);

        this._defineFilters();

        // Инициализация контейнеров
        this._initContainers(this.brush);

        // Размещение контейнеров в рабочей среде
        this._composeContainers();

        // Создать логический объект "Сетка точек"
        this.grid = new Grid(this.containers.grid, GRID_ROWS, GRID_COLS);

        // Отрисовать элементы сетки в контейнере
        this.grid.drawDots(GRID_WIDTH, GRID_HEIGHT);

        // Отрисовать панели с подписями
        this._drawLabelPanes(GRID_WIDTH, GRID_HEIGHT, GRID_COLS, GRID_ROWS);
    };

    /**
     * Инициализировать контейнеры
     *
     * Заполняется объект this.containers
     *
     * @param brush кисть, рисующая в заданной области
     * @private
     */
    _initContainers(brush) {
        // Главная обёртка
        this.containers.wrap = brush.nested();

        // В ней - сетка и панели подписей
        this.containers.grid = this.containers.wrap.nested();

        this.containers.label_panes = {
            left: this.containers.wrap.nested(),    // левая
            top: this.containers.wrap.nested()      // и верхняя
        };
    };

    /**
     * Скомпоновать (разметить) контейнеры в рабочей области
     *
     * @private
     */
    _composeContainers() {
        // Сместить главную обёртку
        this.containers.wrap.move(WRAP_MARGIN, WRAP_MARGIN);

        // Сместить сетки
        this.containers.grid.move(GRID_MARGIN - 20, GRID_MARGIN - 20);

        // Сместить панели
        this.containers.label_panes.left.move(0, GRID_MARGIN - 20);  // левая - сверху
        this.containers.label_panes.top.move(GRID_MARGIN - 20, 0);   // верхняя - слева
    };

    /**
     * Нарисовать панели текстовых подписей для сетки
     *
     * Наполняются контейнеры   this.containers.label_panes.left,
     *                          this.containers.label_panes.right,
     *
     * @param grd_w     Ширина сетки
     * @param grd_h     Высота сетки
     * @param grd_cols  Количество колонок
     * @param grd_rows  Количество рядов
     * @private
     */
    _drawLabelPanes(grd_w, grd_h, grd_cols, grd_rows) {
        // Используем сокращения
        let left = this.containers.label_panes.left;
        let top = this.containers.label_panes.top;

        // Отрисовать сами текстовые метки
        this._drawLabels(left, grd_rows);
        this._drawLabels(top, grd_cols);
    };

    /**
     * Нарисовать текстовые метки в какой-либо панели (левой или верхней)
     *
     * @param label_pane ссылка на панель-контейнер
     * @param grd_steps  число колонок/рядов
     * @private
     */
    _drawLabels(label_pane, grd_steps) {
        // Проходим циклом по всем колонокам/рядам
        for (let iter = 0; iter < grd_steps; iter++)
        {
            // Текстовое содержимое метки по умолчанию - номер колонки/ряда
            let text = iter;
            // Цвет по умолчанию - чёрный
            let color = "#000";
            // Выравнивание по умоланию - по центру
            let positioning = "center";

            // Если панель - слева
            if (this.containers.label_panes.left === label_pane) {

                // Выравнивание - по концу строки
                positioning = "end";

                if (grd_steps - 1 === iter) {        // Если метка последняя
                    text = LABEL_LEFT_LAST;
                    color = "#00f";
                } else if (grd_steps - 2 === iter) { // Если метка предпоследняя
                    text = LABEL_LEFT_LAST_PRE;
                    color = "#f00";
                }

            }

            // Непосредственно формирование текста
            let label = label_pane
                .text(text + "")
                .font({fill: color, anchor: positioning, size: LABELS_FONT_SIZE});

            // Размещение текста зависит от того, левая панель или верхняя
            if (this.containers.label_panes.left === label_pane) {
                label
                    .move(
                        GRID_MARGIN,
                        this.grid.dots[0][iter].y() - 4
                )
            } else {
                label
                    .move(
                        this.grid.dots[iter][0].x(),
                        GRID_MARGIN - LABELS_FONT_SIZE
                )
            }
        }
    };

    /**
     * Определить SVG-фильтры
     *
     * @private
     */
    _defineFilters() {
        let filters = [];

        // Свечение чёрным (по обывательски - тень)
        filters.push(
            '<filter id="black-glow" filterUnits="userSpaceOnUse">\
                <feColorMatrix type="matrix" values=\
                        "0 0 0 0   0\
                         0 0 0 0   0\
                         0 0 0 0   0\
                         0 0 0 0.7 0"/>\
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>\
                <feMerge>\
                    <feMergeNode in="coloredBlur"/>\
                    <feMergeNode in="SourceGraphic"/>\
                </feMerge>\
            </filter>'
        );

        // Свечение цветом обрабатываемого элемента
        filters.push(
            '<filter id="glow" filterUnits="userSpaceOnUse">\
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>\
                <feMerge>\
                    <feMergeNode in="coloredBlur"/>\
                    <feMergeNode in="SourceGraphic"/>\
                </feMerge>\
            </filter>'
        );

        // Фильтры должны храниться в этом узле
        let defs_elem = document.getElementsByTagName("defs");

        defs_elem.html(filters[0]);
        defs_elem.html(filters[1]);
    };

}

export default Breadboard;