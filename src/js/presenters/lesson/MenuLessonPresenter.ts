import Presenter, {on} from "../../core/base/Presenter";
import HomeView from "../../views/common/HomeView";
import CourseModel from "../../models/lesson/CourseModel";
import ProgressModel from "../../models/lesson/ProgressModel";
import {RequestErrorEvent} from "../../core/base/model/HttpModel";

export default class MenuLessonPresenter extends Presenter<HomeView.HomeView> {
    private course: CourseModel;
    private progress: ProgressModel;

    public async getInitialProps() {
        this.course = this.getModel(CourseModel);
        this.progress = this.getModel(ProgressModel);

        const lesson_id = this.progress.getState().lesson_id;

        this.course.list().then((courses) => {this.setViewProps({courses, lesson_id})});

        document.title = `Tapanda | Main menu`;
    }

    @on(HomeView.LessonSelectEvent)
    private forwardLesson(evt: HomeView.LessonSelectEvent) {
        this.forward('lesson', [evt.lesson_id]);
    }

    @on(RequestErrorEvent)
    private showError(evt: RequestErrorEvent) {
        this.setViewProps({
            error: 'Нет доступа к серверу.'
        })
    }
}