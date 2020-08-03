import Wrapper from "../core/Wrapper";

import Swal from 'sweetalert2';

import thm from "../../css/swal.css";

const ALERTS = {
    no_ipc: {
        // title: "Упс...",
        title: "ipc_timeout",
        html:   "Кажется, Вы случайно зашли через браузер. " +
                "Для корректной работы используйте, пожалуйста, наше <b>приложение</b>.",
        image: false
    },
    no_board: {
        // title: "Что-то не так...",
        title: "no_board",
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
                "Пожалуйста, позовите вашего учителя, чтобы он решил проблему.",
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
    },
    short_circuit: {
        title: "Короткое замыкание!",
        icon: "error",
        position: 'top-end',
        allow_outside_click: true,
    }
};

const TOASTS = {
    short_circuit: {
        title: "Короткое замыкание!",
        icon: "error"
    }
}

const Toast = Swal.mixin({
  toast: true,
  position: 'top-start',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  onOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

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

    showAlert(type) {
        if (!(type in ALERTS)) {throw new RangeError(`Type '${type}' does not exist`)}

        this.closeAll();

        let title = ALERTS[type].title;
        let html = this._getContent(type, ALERTS[type].html || "");

        this._alerts[type] = Swal.fire({
            title: title,
            html: html,
            position: ALERTS[type].position || "center",
            icon: ALERTS[type].icon,
            showCancelButton: false,
            showCloseButton: false,
            showConfirmButton: false,
            allowOutsideClick: ALERTS[type].allow_outside_click
        });

        this._state.closed = false;
    }

    hideAlert(type) {
        if (type in this._alerts) {
            this._alerts[type].close();
        }
    }

    toast(type) {
        if (!(type in TOASTS)) {throw new RangeError(`Type '${type}' does not exist`)}

        const title = TOASTS[type].title,
              icon = TOASTS[type].icon;

        Toast.fire({
            title: title,
            icon: icon,
        });
    }

    alertInput(type, confirm_only=false, def_val=false) {
        if (!(type in ALERTS)) {throw new RangeError(`Type '${type}' does not exist`)}

        let title = ALERTS[type].title;
        let html = this._getContent(type, ALERTS[type].html);

        if (confirm_only) {
            return Swal.fire({
                title: title,
                html: html,
                position: ALERTS[type].position,
                cancelButtonText: "Работать без устройства",
                confirmButtonText: "Переподключиться",
                showCancelButton: true,
            });
        }

        return Swal.fire({
            title: title,
            input: "text",
            inputValue: def_val ? "#" : "",
            inputAttributes: {
                placeholder: "#",
            }
        });
    }

    closeAll() {
        try {
            Swal.close();
        } catch (e) {
            this._debug.debug("Nothing to close, skipping...");
        }
    }

    _getContent(type, html) {
        if (this._images_path && 'image' in ALERTS[type] && ALERTS[type].image) {
            html += `<br><img src='${this._images_path}/${ALERTS[type].image}' style="width: 200px; margin-top: 20px;">`
        }

        return html;
    }
}