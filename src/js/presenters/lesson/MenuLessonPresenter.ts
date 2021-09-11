import Presenter, {on} from "../../core/base/Presenter";
import HomeView from "../../views/common/HomeView";
import CourseModel from "../../models/lesson/CourseModel";
import ProgressModel from "../../models/lesson/ProgressModel";
import {RequestErrorEvent} from "../../core/base/model/HttpModel";

import i18next from 'i18next';

export default class MenuLessonPresenter extends Presenter<HomeView.HomeView> {
    private course: CourseModel;
    private progress: ProgressModel;
    load_handle: ReturnType<typeof setTimeout>;

    public async getInitialProps() {
        this.course = this.getModel(CourseModel);
        this.progress = this.getModel(ProgressModel);

        this.loadCourses();

        document.title = `Tapanda | Main menu`;
    }

    @on(HomeView.LessonSelectEvent)
    private forwardLesson(evt: HomeView.LessonSelectEvent) {
        this.forward('lesson', [evt.lesson_id]);
    }

    @on(RequestErrorEvent)
    private showError(evt: RequestErrorEvent) {
        this.setViewProps({
            error: i18next.t("main:home.error.no_server_access")
        });

        this.load_handle = setTimeout(() => {
            this.loadCourses();
        }, 2000);
    }

    private loadCourses() {
        const lesson_id = this.progress.getState().lesson_id;
        this.course.list().then((courses) => {
            clearTimeout(this.load_handle);
            this.setViewProps({ error: null, courses, lesson_id });
        });
    }
}