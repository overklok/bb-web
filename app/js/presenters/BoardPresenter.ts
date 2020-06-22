import Presenter, {action} from "../core/ui/Presenter";
import {Action, BooleanAction} from "../core/ui/Event";
import BoardView from "../views/BoardView";

export class EditAction extends BooleanAction<EditAction> {}

export default class BoardPresenter extends Presenter<BoardView> {
    protected static actions: Map<Action<any>, string> = new Map([
        [EditAction, 'Редактировать'],
    ]);

    @action(EditAction)
    test() {
        this.view.setReadOnly(true);
    }
}