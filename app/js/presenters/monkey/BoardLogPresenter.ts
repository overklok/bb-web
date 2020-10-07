import Presenter, {on} from "../../core/base/Presenter";
import BoardLogView, {LogEntryClickEvent} from "../../views/monkey/LogView";
import BoardLogModel, {BoardLogUpdate} from "../../models/monkey/BoardLogModel";
import ModalModel from "../../core/models/ModalModel";
import BoardPreviewPresenter from "../common/BoardPreviewPresenter";

export default class BoardLogPresenter extends Presenter<BoardLogView> {
    private mdl_log: BoardLogModel;
    private mdl_modal: ModalModel;
    protected ready() {
        this.mdl_log = this.getModel(BoardLogModel);
        this.mdl_modal = this.getModel(ModalModel);
    }

    @on(BoardLogUpdate)
    private updateLog() {
        this.view.setLog(this.mdl_log.getState());
    }

    @on(LogEntryClickEvent)
    private showEntryDetails(evt: LogEntryClickEvent) {
        let group, entry;

        try {
            group = this.mdl_log.getGroup(evt.grp_idx);
            entry = group.entries[evt.ent_idx];
            if (!entry) {
                throw new RangeError(`Invalid index of entry ${evt.ent_idx}`);
            }
        } catch (e) {
            console.error(e);

            this.mdl_modal.showModal({
                content: 'Невозможно отобразить запись',
                dialog: {
                    heading: `Внутренняя ошибка`
                }
            });

            return;
        }

        const datetime = new Date(group.ts_start + entry.rts);

        if (entry.plates) {
            BoardPreviewPresenter.previewBoard.plates = entry.plates;
            BoardPreviewPresenter.previewBoard.layout = entry.layout_name;

            this.mdl_modal.showModal({
                widget_alias: 'board_preview',
                dialog: {
                    heading: `Журнал: доска в ${datetime.toTimeString()}`
                }
            });
        }

        else if (entry.error) {
            this.mdl_modal.showModal({
                content: `[${entry.error.code}] ${entry.error.message}`,
                dialog: {
                    heading: `Журнал: ошибка в ${datetime.toTimeString()}`
                }
            });
        }
    }
}