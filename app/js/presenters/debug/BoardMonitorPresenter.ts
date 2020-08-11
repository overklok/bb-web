import Presenter, {on} from "../../core/base/Presenter";
import BoardView, {ChangeEvent} from "../../views/BoardView";
import BreadboardModel, {ElectronicEvent} from "../../models/BreadboardModel";

export default class BoardMonitorPresenter extends Presenter<BoardView> {
    private model: BreadboardModel;

    protected ready() {
        this.model = this.getModel(BreadboardModel);
    }

    @on(ChangeEvent)
    private onchange(evt: ChangeEvent) {
        this.model.sendPlates(this.view.getPlates());
    }

    @on(ElectronicEvent)
    private onelec(evt: ElectronicEvent) {
        console.log(evt);

        this.view.setCurrents(evt.threads);
    }
}