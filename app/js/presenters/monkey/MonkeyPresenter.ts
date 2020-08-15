import Presenter, {on} from "../../core/base/Presenter";
import MonkeyView, {ConfigureEvent} from "../../views/monkey/MonkeyView";
import ModalModel from "../../core/models/ModalModel";

export default class MonkeyPresenter extends Presenter<MonkeyView> {
    private modal: ModalModel;

    protected ready() {
        this.modal = this.getModel(ModalModel);
    }

    @on(ConfigureEvent)
    protected runConfigurator() {
        this.modal.showModal({
            widget_alias: 'testkit',
            heading: 'Изменить набор плашек',
            is_dialog: true,
            size: 'lg'
        });
    }
}