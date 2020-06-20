import BoardView from "../views/BoardView";
import BoardPresenter from "../presenters/BoardPresenter";

export default {
    board: {view_type: BoardView, presenter_types: [BoardPresenter]},
}