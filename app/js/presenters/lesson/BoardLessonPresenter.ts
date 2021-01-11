import Presenter, {on} from "../../core/base/Presenter";
import BoardView from "../../views/common/BoardView";
import BoardModel from "../../models/common/BoardModel";
import SettingsModel, {SettingsChangedEvent} from "../../models/lesson/SettingsModel";

export default class BoardLessonPresenter extends Presenter<BoardView.BoardView> {
    private board: BoardModel;
    private settings: SettingsModel;

    public getInitialProps() {
        this.board = this.getModel(BoardModel);
        this.settings = this.getModel(SettingsModel);
    }

    @on(SettingsChangedEvent)
    private updateSettingsChange() {
        this.view.setReadOnly(!this.settings.getState().is_demo);
    }
}