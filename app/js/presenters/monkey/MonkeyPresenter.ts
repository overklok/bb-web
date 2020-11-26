import Presenter, {on} from "../../core/base/Presenter";
import MonkeyView, {ApproveClick, ConfigureClick} from "../../views/monkey/MonkeyView";
import ModalModel from "../../core/models/ModalModel";
import BoardModel, {BoardErrorEvent, Plate, PlateEvent, UserPlateEvent} from "../../models/common/BoardModel";
import Breadboard from "../../utils/breadboard/Breadboard";
import TestkitModel, {ReferenceEvent} from "../../models/monkey/TestkitModel";
import BoardLogModel from "../../models/monkey/BoardLogModel";

export default class MonkeyPresenter extends Presenter<MonkeyView> {
    private modal: ModalModel;
    private assembly: Plate[];
    private reference: Plate[];
    private log: BoardLogModel;

    private testkit: TestkitModel;
    private is_equal: boolean;
    private assembly_board: BoardModel;

    public getInitialProps() {
        this.modal = this.getModel(ModalModel);
        this.testkit = this.getModel(TestkitModel);
        this.assembly_board = this.getModel(BoardModel);
        this.log = this.getModel(BoardLogModel);
    }

    @on(PlateEvent, UserPlateEvent)
    protected setAssembly(evt: PlateEvent) {
        this.log.addPlates(evt.plates, this.assembly_board.getState().layout_name);
        this.assembly = evt.plates;
        this.comparePlates();
    }

    @on(BoardErrorEvent)
    protected setError(evt: BoardErrorEvent) {
        this.log.addError({...evt});
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
                dialog: {heading: 'Рассмотреть схему как собранную', label_accept: 'Да', label_dismiss: 'Нет'},
                content: 'Вы уверены?',
                is_closable: false,
            });
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
        if (!this.assembly || !this.reference) return;

        const is_equal = this.isPlateSetsEqual();

        if (!this.is_equal && is_equal) {
            this.is_equal = true;
            this.testkit.requestNewReference();
            this.log.finishGroup();
        } else {
            this.is_equal = false;
        }
    }

    private isPlateSetsEqual(): boolean {
        let is_equal = this.assembly.length === this.reference.length;

        if (is_equal) {
            for (const plate_a of this.assembly) {
                let has_matches = false;

                for (const plate_r of this.reference) {
                    is_equal = this.isPlatesEqual(plate_a, plate_r);

                    if (is_equal) {
                        has_matches = true;
                        break;
                    }
                }

                if (!has_matches) {
                    is_equal = false;
                    console.log(plate_a);
                    break;
                }
            }
        }

        return is_equal;
    }

    private isPlatesEqual(plate_a: Plate, plate_b: Plate): boolean {
        const layout = BoardModel.Layouts[this.assembly_board.getBoardLayout()];

        return Breadboard.comparePlates(layout, plate_a, plate_b);
    }
}