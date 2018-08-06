import Wrapper from "../core/Wrapper";

import swal from 'sweetalert';

import thm from "../../css/swal.css";

const ALERTS = {
    no_ipc: {
        title: "Упс...",
        html:   "Кажется, Вы случайно зашли через браузер. " +
                "Для корректной работы используйте, пожалуйста, наше <b>приложение</b>.",
        image: false
    },
    no_board: {
        title: "Что-то не так...",
        html:   "<b>Подключите</b> макетную плату Тапанда в порт USB Вашего компьютера с помощью кабеля " +
                "либо <b>извлеките и снова вставьте</b> кабель.",
        image: "usb.gif",
    },
    command: {
        title: "Введите команду:",
    },
    no_server: {
        title: "Нет связи с устройством",
        html:   "Без специальной службы работать с устройством не получится. " +
                "Пожалуйста, позовите вашего руководителя, чтобы он решил проблему.",
        image: "terminal.gif"
    },
    another_client: {
        title: "Обновите эту страницу",
        html: "Скорее всего, Вы открыли приложение где-то ещё. Если Вы пользуетесь " +
        "несколькими браузерами, проверьте, не открыта ли страница в них. Плата может работать только с " +
        "одной из них."
    },
    reconnect: {
        title: "Приложение запущено",
        html: "Скорее всего, Вы открыли приложение где-то ещё. Если Вы пользуетесь " +
        "несколькими браузерами, проверьте, не открыта ли страница в них. Плата может работать только с " +
        "одной из них."
    }
};

export default class AlertifierWrapper extends Wrapper {
    constructor() {
        super();

        this._alerts = {
            noBoard: undefined,
        };

        this._state = {
            closed: true,
        };

        this._images_path = undefined;
    }

    setImagesPath(path) {
        this._images_path = path;
    }

    alertIndelible(type) {
        if (!(type in ALERTS)) {throw new RangeError(`Type '${type}' does not exist`)}

        if (!this._state.closed) {
            this.closeAll();
        }

        let title = ALERTS[type].title;
        let html = ALERTS[type].html;

        let node = this._getContentNode(type, html);

        this._alerts[type] = swal({
            title: title,
            content: node,
            button: false,
            closeOnClickOutside: false,
        });

        this._state.closed = false;
    }

    alertInput(type, confirm_only=false) {
        if (!(type in ALERTS)) {throw new RangeError(`Type '${type}' does not exist`)}

        let title = ALERTS[type].title;
        let html = ALERTS[type].html;

        let node = this._getContentNode(type, html);

        if (confirm_only) {
            return swal({
                title: title,
                content: node,
                buttons: {
                    cancel: "Работать без устройства",
                    confirm: "Переподключиться",
                },
            });
        }

        return swal({
            title: title,
            content: {
                element: "input",
                attributes: {
                    placeholder: "#",
                    type: "text",
                },
            },
        });
    }

    closeAll() {
        if (!this._state.closed) {
            swal.close();
            this._state.closed = true;
        }
    }

    _getContentNode(type, html) {
        let node = document.createElement("div");

        if (this._images_path && 'image' in ALERTS[type] && ALERTS[type].image) {
            html += `<br><img src='${this._images_path}/${ALERTS[type].image}' style="width: 200px; margin-top: 20px;">`
        }

        node.innerHTML = html;

        return node;
    }
}