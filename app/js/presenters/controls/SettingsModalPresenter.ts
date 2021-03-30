import ModalPresenter from "../../core/presenters/ModalPresenter";
import {on} from "../../core/base/Presenter";
import SettingsModel, {SettingsModalEvent} from "../../core/models/SettingsModel";
import {ModalAction} from "../../core/base/view/Nest";

export default class SettingsModalPresenter extends ModalPresenter {
    private mdl: number;
    private settings: SettingsModel;

    static ModalType = 'settings';

    getInitialProps(): any {
        this.settings = this.getModel(SettingsModel);

        super.getInitialProps();

        return {};
    }

    @on(SettingsModalEvent)
    showSettingsModal() {
        this.mdl = this.pushModal({
            widget_alias: 'settings',
            size: 'lg',
            is_closable: true,
            is_close_manual: true,
            dialog: {
                heading: 'Настройки',
                label_accept: 'Сохранить',
                label_dismiss: 'Отменить',
                is_acceptable: true,
                is_dismissible: true,
                on_action: (action: ModalAction) => {
                    if (action === ModalAction.Escape) {
                        this.handleModalEscape();
                    } else {
                        this.closeModal(this.mdl, SettingsModalPresenter.ModalType);
                    }
                },
            }
        }, SettingsModalPresenter.ModalType);
    }

    handleModalEscape() {
        if (!this.settings.isDirty()) {
            this.closeModal(this.mdl, SettingsModalPresenter.ModalType);
            return;
        }

        this.pushModal({
            dialog: {
                heading: 'Отменить изменения',
                label_accept: 'Отменить',
                label_dismiss: 'Вернуться',
                is_acceptable: true,
                is_dismissible: true,
                on_action: action => {
                    if (action === ModalAction.Accept) {
                        this.closeModal(this.mdl, SettingsModalPresenter.ModalType);
                    } else {
                        this.settings.rollbackSettings();
                    }
                }
            }
        })
    }
}