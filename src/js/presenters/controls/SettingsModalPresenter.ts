import isEqual from "lodash/isEqual";
import defaultsDeep from "lodash/defaultsDeep";

import ModalPresenter from "../../core/presenters/ModalPresenter";
import {on} from "../../core/base/Presenter";
import SettingsModel, {SettingsChangeEvent, SettingsModalEvent} from "../../core/models/SettingsModel";
import {ModalAction} from "../../core/base/view/Nest";
import {SettingsValues} from "../../core/datatypes/settings";

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
        this.saveSettings();

        this.mdl = this.pushModal({
            widget_alias: 'settings',
            size: 'lg',
            height: '70%',
            is_closable: true,
            is_close_manual: true,
            dialog: {
                heading: 'Настройки',
                label_accept: 'Сохранить',
                label_dismiss: 'Отменить',
                is_acceptable: true,
                is_dismissible: true,
                on_action: (action: ModalAction) => {
                    switch (action) {
                        case ModalAction.Escape: {
                            this.handleModalEscape(); 
                            break;
                        }
                        case ModalAction.Dismiss: {
                            this.rollbackSettings();
                            this.closeModal(this.mdl, SettingsModalPresenter.ModalType);
                            break;
                        }
                        case ModalAction.Accept: {
                            this.saveSettings();
                            this.closeModal(this.mdl, SettingsModalPresenter.ModalType);
                            break;
                        }
                    }
                },
            }
        }, SettingsModalPresenter.ModalType);
    }

    handleModalEscape() {
        if (!this.isDirty()) {
            this.closeModal(this.mdl, SettingsModalPresenter.ModalType);
            return;
        }

        this.pushModal({
            size: 'sm',
            content: 'Хотите отменить внесённые изменения?',
            dialog: {
                label_accept: 'Назад',
                label_dismiss: 'Отменить',
                is_acceptable: true,
                is_dismissible: true,
                on_action: action => {
                    if (action === ModalAction.Dismiss) {
                        this.rollbackSettings();
                        this.closeModal(this.mdl, SettingsModalPresenter.ModalType);
                    } 
                }
            }
        })
    }

    public saveSettings() {
        this.saved = this.model.getState().values;
    }

    public isDirty() {
        return !isEqual(this.saved, this.model.getState().values);
    }

    public rollbackSettings() {
        this.model.applySettings(this.saved);
    }

    @on(SettingsChangeEvent)
    handleModelChange(evt: SettingsChangeEvent) {
        if (!evt.is_manual) {
            this.saved = defaultsDeep(evt.values, this.saved);
        }
    }
}
