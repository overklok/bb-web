import Presenter, {action} from "../core/base/Presenter";
import {Action, BooleanAction} from "../core/base/Event";
import BoardView from "../views/BoardView";

export class EditAction extends BooleanAction<EditAction> {}

export default class BoardPresenter extends Presenter<BoardView> {
    // TODO: Move Actions declatarion to View but leave usage here
    protected static actions: Map<Action<any>, string> = new Map([
        [EditAction, 'Редактировать'],
    ]);

    @action(EditAction)
    test() {
        this.view.setReadOnly(true);
    }
}