import {ImperativeView} from "../../core/base/view/ImperativeView";
import {deferUntilMounted, IViewOptions, IViewProps, IViewState} from "../../core/base/view/View";
import LessonPaneWrapper from "../../wrappers/LessonPaneWrapper";

// passed by DefinePlugin in Webpack config
declare const __VERSION__: string;

const BOARD_STATUSES = {
    SEARCH: 'search',
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    NONE: 'none',
};

interface NavbarViewOptions extends IViewOptions {
    logoText: string;
    imagesPath: string;
    devMode: boolean;
}

export namespace NavbarView {
    export class NavbarView extends ImperativeView<NavbarViewOptions> {
        static defaultOptions: NavbarViewOptions = {
            logoText: "Tapanda",
            imagesPath: "",
            devMode: false
        }

        private lesson_pane: LessonPaneWrapper;

        constructor(props: IViewProps<NavbarViewOptions>) {
            super(props);

            this.lesson_pane = new LessonPaneWrapper();
            this.lesson_pane.registerLogoText("Tapanda");
            this.setMenuStructure();

            if (this.options.devMode) {
                this.clickDeveloperMenuBarItem(true);
            } else {
                this.clickDeveloperMenuBarItem(false);
            }

            this.setup();
        }

        protected inject(container: HTMLDivElement): void {
            this.lesson_pane.inject(container);
        }

        protected eject(container: HTMLDivElement): void {

        }

        /**
         * Показать кнопки заданий
         *
         * Информация о каждом задании представляется следующим форматом:
         * {
         *      'category': номер категории,
         *      'exercises': массив упражнений (см. ниже),
         *      'name': название задания (опционально)
         * }
         *
         * Информация о каждом упражнении представляется следующим форматом:
         * {
         *      mission: ID задания,
         *      pk: ID упражнения
         * }
         *
         * @param missions список заданий
         */
        public showMissionButtons(missions: any) {
            this.lesson_pane.setMissions(missions);
        }

        /**
         * Установить текущее задание
         *
         * @param mission_idx индекс задания
         */
        public setMissionCurrent(mission_idx: number) {
            this.lesson_pane.setMissionActive(mission_idx);
        }

        /**
         * Установить прогресс задания
         *
         * Информация о задании представляется с помощью сследующего формата:
         * {
         *      'missionIDX': номер задания,
         *      'exerciseCount': кол-во упражнений в задании,
         *      'exerciseIDX': текущее упражнение в задании
         * }
         */
        public setMissionProgress(mission_idx: number, exercise_idx: number) {
            this.lesson_pane.setMissionProgress(mission_idx, exercise_idx);
        }

        /**
         * Включить режим "пробуксовки" задания
         *
         * Режим "пробуксовки" - состояние задания, при котором номер текущего
         * упражнения не совпадает с номером последнего: например, пользователь отказался
         * переходить на следующее упражнение при прохождении текущего.
         *
         * @param mission_idx индекс задания
         */
        public setMissionSkiddingOn(mission_idx: number) {
            this.lesson_pane.setMissionSkidding(mission_idx, true);
        }

        /**
         * Установить текущее упражнение
         *
         * Выделяется указываемое упражнение текущего задания
         *
         * @param {number} exercise_idx индекс упражнения
         * @returns {Promise<any>}
         */
        public setExerciseCurrent(exercise_idx: number) {
            this.lesson_pane.setExerciseActive(exercise_idx);
        }

        /**
         * Установить текст урока
         *
         * @param lesson_name название урока
         */
        @deferUntilMounted
        public setLessonText(lesson_name: string) {
            let text = "Урок: " + lesson_name;

            this.lesson_pane.setLessonText(text);
        }

        public switchMenu(on: boolean) {
            this.lesson_pane.switchMenu(on);
        }

        public switchDeveloperMode(on: boolean) {
            this.lesson_pane.switchDevMode(on);
        }

        private clickDeveloperMenuBarItem(on: boolean) {
            this.lesson_pane.clickMenuBarItem({item_name: "developer", on});
        }

        private setMenuStructure() {
            this.lesson_pane.setMenuStructure([
                {
                    type: 'default',
                    name: "lessons",
                    text: "Уроки",
                    handler: (name: string) => {
                        console.log('menu click', name);
                    }
                },
                {
                    type: 'default',
                    name: "settings",
                    text: "Настройки",
                    handler: (name: string) => {
                        console.log('settings click', name);
                    }
                },
                {
                    type: 'radio',
                    name: "developer",
                    text: "Разработчик",
                    handler: (name: string, pressed: boolean) => {
                        console.log('developer click', {name: name, state: pressed});
                    }
                },
                {
                    type: 'disabled',
                    name: "origin",
                    text: window.location.host,
                    text_sub: __VERSION__,
                    right: true
                },
            ]);
        }

        private setup() {
            this.lesson_pane.onMissionClick((idx: number) => {
                console.log('on mission click', idx);
            });

            this.lesson_pane.onMenuClick(() => {
                console.log('on menu click');
            });

            this.lesson_pane.onReturnClick(() => {
                console.log('on return click');
            });

            this.lesson_pane.onExerciseClick((id: number) => {
                console.log('on exercise click', id);
            });

            this.lesson_pane.onUserExerciseClick((mission_idx: number, exercise_idx: number) => {
                console.log('on user_exercise click', mission_idx, exercise_idx);
            });

            this.lesson_pane.onStatusClick(() => {
                console.log('reconnect');
            });
        }
    }
}