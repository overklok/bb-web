import isEqual from "lodash/isEqual";
import defaultsDeep from "lodash/defaultsDeep";

import ModalPresenter from "../../core/presenters/ModalPresenter";
import {on} from "../../core/base/Presenter";
import SettingsModel, {SettingsChangeEvent, SettingsModalEvent} from "../../core/models/SettingsModel";
import {ModalAction} from "../../core/base/view/Nest";
import {SettingsValues} from "../../core/datatypes/settings";

import i18next from 'i18next';

export default class SettingsModalPresenter extends ModalPresenter {
    private mdl: number;
    private model: SettingsModel;

    static ModalType = 'settings';

    private saved: SettingsValues = {};

    getInitialProps(): any {
        this.model = this.getModel(SettingsModel);

        super.getInitialProps();

        return {};
    }

    @on(SettingsModalEvent)
    showSettingsModal() {
        this.model.commit();

        this.mdl = this.pushModal({
            widget_alias: 'settings',
            size: 'lg',
            height: '70%',
            is_closable: true,
            is_close_manual: true,
            dialog: {
                heading: i18next.t('main:settings.modal.main.heading'),
                label_accept: i18next.t('main:settings.modal.main.accept'),
                label_dismiss: i18next.t('main:settings.modal.main.dismiss'),
                is_acceptable: true,
                is_dismissible: true,
                on_action: (action: ModalAction) => {
                    switch (action) {
                        case ModalAction.Escape: {
                            this.handleModalEscape(); 
                            break;
                        }
                        case ModalAction.Dismiss: {
                            this.model.rejectUncommitted();
                            this.closeModal(this.mdl, SettingsModalPresenter.ModalType);
                            break;
                        }
                        case ModalAction.Accept: {
                            this.model.commit();
                            this.closeModal(this.mdl, SettingsModalPresenter.ModalType);
                            break;
                        }
                    }
                },
            }
        }, SettingsModalPresenter.ModalType);
    }

    handleModalEscape() {
        if (!this.model.hasUncommitted()) {
            this.closeModal(this.mdl, SettingsModalPresenter.ModalType);
            return;
        }

        this.pushModal({
            size: 'sm',
            content: i18next.t('main:settings.modal.escape.content'),
            dialog: {
                label_accept: i18next.t('main:settings.modal.escape.accept'),
                label_dismiss: i18next.t('main:settings.modal.escape.dismiss'),
                is_acceptable: true,
                is_dismissible: true,
                on_action: action => {
                    if (action === ModalAction.Dismiss) {
                        this.model.rejectUncommitted();
                        this.closeModal(this.mdl, SettingsModalPresenter.ModalType);
                    } 
                }
            }
        })
    }
}
