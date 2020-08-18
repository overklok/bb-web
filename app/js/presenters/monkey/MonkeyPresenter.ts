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
    protected async approveAssembly() {
        if (!this.is_equal) {
            const answer = await this.modal.showQuestionModal({
                dialog: {heading: 'а че такое',},
                content: 'а как какать',
            })
        }
    }

    @on(ConfigureClick)
    protected runConfigurator() {
        this.modal.showModal({
            widget_alias: 'testkit',
            size: 'lg',
            dialog: {
                heading: 'Изменить набор плашек'
            }
        });
    }

    private comparePlates() {
        this.is_equal = isEqual(sortBy(this.assembly), sortBy(this.reference));

        this.view.setApproveActive(this.is_equal);
    }
}