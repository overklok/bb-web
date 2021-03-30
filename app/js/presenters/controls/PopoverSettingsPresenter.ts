import ModalPresenter from "../../core/presenters/ModalPresenter";

export default class PopoverSettingsPresenter extends ModalPresenter {
    private mdl: number;

    showSettingsModal() {
        this.mdl = this.pushModal({
            widget_alias: 'settings',
            size: 'lg',
            dialog: {
                heading: 'Настройки',
                label_accept: 'Сохранить',
                label_dismiss: 'Отменить',
                on_accept: true,
                on_dismiss: true,
            }
        }, 'settings');
    }

    hideSettingsModal() {
        if (this.mdl == null) return;
        this.closeModal(this.mdl, 'settings');
    }

    // TODO:
    // @on(ModalActionEvent)
    // protected handleModalAction() {
    //
    // }
}