const CM_WIDTH = 360;
const CM_HEIGHT = 50;

export default class ContextMenu {
    constructor() {
        this._width = CM_WIDTH; 
        this._height = 0;
        
        this._item_height = CM_HEIGHT; 
        
        this._callbacks = {
            itemclick: () => {}
        }
    }
    
     /**
     * Установить обработчик нажатия на пункт контекстного меню
     *
     * @param {function} cb обработчик нажатия на пункт контекстного меню.
     */
    onItemClick(cb) {
        if (!cb) {this._callbacks.itemclick = () => {}}

        this._callbacks.itemclick = cb;
    }
    
    /**
     * Отобразить контекстное меню
     *
     * @param {MouseEvent}      evt         событие нажатия кнопки мыши
     * @param {HTMLElement}     svg_main    родительский SVG-узел
     */
    show(container, offset, evt, svg_main) {
        // if (this._dragging) return;
        //
        // if (this._ctx_menu_active) {
        //     this.hide();
        // }
        //
        // let cmi_w = CM_WIDTH, cmi_h = CM_HEIGHT;

        // let offset = {
        //     x: this._state.cell.size.x + this.__grid.gap.x,
        //     y: this._state.cell.size.y * 2 + this.__grid.gap.y
        // };

        // let nested = this._ctx_menu_group.nested();

        // nested.addClass(Plate.ContextMenuClass);

        this._ctx_menu_height = 0;
        this.appendContextMenuItem(container, cmi_w, cmi_h, `Плашка #${this.id}`, false);
        this.appendContextMenuItem(container, cmi_w, cmi_h, Plate.CMI_SWITCH);
        this.appendContextMenuItem(container, cmi_w, cmi_h, Plate.CMI_ROTCW);
        this.appendContextMenuItem(container, cmi_w, cmi_h, Plate.CMI_ROTCCW);
        this.appendContextMenuItem(container, cmi_w, cmi_h, Plate.CMI_REMOVE);

        if (evt && svg_main) {
            let svg_point = svg_main.createSVGPoint();
            let cursor_point = Plate._getCursorPoint(svg_main, svg_point, evt);

            container.move(
                cursor_point.x - this._container.x() - offset.x,
                cursor_point.y - this._container.y() - offset.y,
            );

            /// проверка на вылет за область видимости
            let global_pos = {
                x: cursor_point.x - offset.x + cmi_w,
                y: cursor_point.y - offset.y + this._ctx_menu_height,
            };

            if (global_pos.x > this.__grid.size.x) {container.dx(-cmi_w)}
            if (global_pos.y > this.__grid.size.y) {container.dy(-this._ctx_menu_height)}
        }

        container.addClass('fade-in');

        this._ctx_menu_group.opacity(1);
        this._ctx_menu_active = true;
    }
    
    /**
     * Скрыть контекстное меню
     */
    hide() {
        if (!this._ctx_menu_active) return;

        this._ctx_menu_group.clear();
        this._ctx_menu_group.opacity(0);

        this._ctx_menu_active = false;
    }
    
    /**
     * Добавить пункт к контекстному меню
     *
     * @param {SVG.Group}   container   контейнер контекстного меню
     * @param {number}      width       ширина контекстного меню
     * @param {number}      height      высота пункта
     * @param {string}      alias       алиас пункта
     * @param {boolean}     active      активен ли пункт
     */
    appendItem(container, width, height, alias, active=true) {
        let rect = container.rect(width, height)
                .fill("#e7e4ff")
                .x(-10)
                .y(this._ctx_menu_height);

        let label = alias in CM_LABELS ? CM_LABELS[alias] : alias;

        let text = container.text(label).y(this._ctx_menu_height).font({size: 24});

        text.build(true);

        if (CM_SHORTCUTS[alias]) {
            text.plain(' (');
            text.tspan(CM_SHORTCUTS[alias]).font({style: 'italic', weight: 'bolder'});
            text.plain(')');
        }

        if (active) {
            rect.addClass(Plate.ContextMenuItemClass);
            text.addClass(Plate.ContextMenuItemTextClass);
        } else {
            rect.addClass(Plate.ContextMenuItemDisabledClass);
            text.addClass(Plate.ContextMenuItemDisabledTextClass);
        }

        text.build(false);

        rect.mousedown(() => {
            setTimeout(() => {
                this._callbacks.ctxmenuitemclick(alias);
                this.hideContextMenu();
            }, 100);
        });

        this._ctx_menu_height += height;
    }
}