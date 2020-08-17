import Presenter, {on} from "../../core/base/Presenter";
import MonkeyView, {ApproveClick, ConfigureClick} from "../../views/monkey/MonkeyView";
import ModalModel from "../../core/models/ModalModel";
import ReferenceBoardModel, {ReferenceEvent} from "../../models/monkey/ReferenceBoardModel";
import {Plate, PlateEvent} from "../../models/common/BoardModel";
import {isEqual, sortBy} from "lodash";

export default class MonkeyPresenter extends Presenter<MonkeyView> {
    private modal: ModalModel;
    private assembly: Plate[];
    private reference: Plate[];

    private reference_board: ReferenceBoardModel;
    private is_equal: boolean;

    protected ready() {
        this.modal = this.getModel(ModalModel);
        this.reference_board = this.getModel(ReferenceBoardModel);
    }

    @on(PlateEvent)
    protected setAssembly(evt: PlateEvent) {
        this.assembly = evt.plates;
        this.comparePlates();
    }

    @on(ReferenceEvent)
    protected setReference(evt: ReferenceEvent) {
        this.reference = evt.plates;
        this.comparePlates();
    }

    @on(ApproveClick)
    protected approveAssembly() {
        if (!this.is_equal) {
            this.modal.showModal({
                heading: 'а че такое',
                content: 'а как какать',
                is_dialog: true,
            })
        }
    }

    @on(ConfigureClick)
    protected runConfigurator() {
        this.modal.showModal({
            widget_alias: 'testkit',
            heading: 'Изменить набор плашек',
            is_dialog: true,
            size: 'lg'
        });
    }

    private comparePlates() {
        this.is_equal = isEqual(sortBy(this.assembly), sortBy(this.reference));

        this.view.setApproveActive(this.is_equal);
    }
}