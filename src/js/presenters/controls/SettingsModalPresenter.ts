import i18next from "i18next";

import ModalPresenter from "~/js/core/presenters/ModalPresenter";
import {on} from "~/js/core/base/Presenter";
import SettingsModel, {SettingsChangeEvent, SettingsModalEvent} from "~/js/core/models/SettingsModel";
import {SettingsValues} from "~/js/core/datatypes/settings";
import ConnectionModel from "~/js/models/common/ConnectionModel";
import {ModalAction} from "~/js/core/views/ModalView";

export default class SettingsModalPresenter extends ModalPresenter {
    private mdl: number;
    private settings: SettingsModel;
    private connection: ConnectionModel;

    static ModalType = 'settings';

    private saved: SettingsValues = {};

    getInitialProps(): any {
        this.settings = this.getModel(SettingsModel);
        this.connection = this.getModel(ConnectionModel);

        super.getInitialProps();

        return {};
    }

    @on(SettingsChangeEvent)
    protected handleSettingsChange() {
        i18next.changeLanguage(String(this.settings.getChoiceSingle('general.language', true)));
        this.connection.requestSaveLanguage(String(this.settings.getChoiceSingle('general.language')));
    }

    @on(SettingsModalEvent)
    showSettingsModal() {
        this.settings.commit();

        this.mdl = this.pushModal({
            widget_alias: 'settings',
            size: 'lg',
            height: '70%',
            is_closable: true,
            is_close_manual: true,
            dialog: {
                heading: 'main:settings.modal.main.heading',
                label_accept: 'main:settings.modal.main.accept',
                label_dismiss: 'main:settings.modal.main.dismiss',
                is_acceptable: true,
                is_dismissible: true,
                on_action: (action: ModalAction) => {
                    switch (action) {
                        case ModalAction.Escape: {
                            this.handleModalEscape(); 
                            break;
                        }
                        case ModalAction.Dismiss: {
                            this.settings.rejectUncommitted();
                            this.closeModal(this.mdl, SettingsModalPresenter.ModalType);
                            break;
                        }
                        case ModalAction.Accept: {
                            this.settings.commit();
                            this.closeModal(this.mdl, SettingsModalPresenter.ModalType);
                            break;
                        }
                    }
                },
            }
        }, SettingsModalPresenter.ModalType);
    }

    handleModalEscape() {
        if (!this.settings.hasUncommitted()) {
            this.closeModal(this.mdl, SettingsModalPresenter.ModalType);
            return;
        }

        this.pushModal({
            size: 'sm',
            content: 'main:settings.modal.escape.content',
            dialog: {
                label_accept: 'main:settings.modal.escape.accept',
                label_dismiss: 'main:settings.modal.escape.dismiss',
                is_acceptable: true,
                is_dismissible: true,
                on_action: action => {
                    if (action === ModalAction.Dismiss) {
                        this.settings.rejectUncommitted();
                        this.closeModal(this.mdl, SettingsModalPresenter.ModalType);
                    } 
                }
            }
        })
    }
}
