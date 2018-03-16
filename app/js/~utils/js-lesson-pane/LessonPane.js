import MissionBarBlock from "./blocks/bars/MissionBarBlock";
import LessonBarBlock from "./blocks/bars/LessonBarBlock";
import MenuBarBlock from "./blocks/bars/MenuBarBlock";
import CourseChipBlock from "./blocks/chips/CourseChipBlock";
import LogoChipBlock from "./blocks/chips/LogoChipBlock";
import MenuChipBlock from "./blocks/chips/MenuChipBlock";
import TaskChipBlock from "./blocks/chips/TaskChipBlock";
import FlipperBlock from "./blocks/FlipperBlock";

import thm from "./styles/containers/lesson-pane.css";

const CLASEES = {
    CONTAINER_MAIN: "lesson-pane"
};

class LessonPane {
    constructor() {
        this._container = undefined;

        this._containers = {
            north: {
                west: undefined,
                center: {
                    front: {
                        west: undefined,
                        center: undefined,
                    },
                    top: {
                        center: undefined,
                    }
                }
            },
            south: {
                west: undefined,
                center: undefined
            }
        };

        this._blocks = {
            bars: {
                lesson: new LessonBarBlock(),
                menu: new MenuBarBlock(),
                mission: new MissionBarBlock(),
            },

            chips: {
                course: new CourseChipBlock(),
                logo: new LogoChipBlock(),
                menu: new MenuChipBlock(),
                task: new TaskChipBlock()
            },

            flipper: new FlipperBlock()
        };

        this._state = {
            included: false
        };
    }

    /**
     * Встроить панель
     *
     * @param dom_node
     */
    include(dom_node) {
        if (!dom_node) {throw new TypeError("DOM Node is not defined")}

        this._container = document.createElement("div");
        this._container.classList = CLASEES.CONTAINER_MAIN;
        dom_node.appendChild(this._container);

        this._composeContainers(this._container, this._containers, CLASEES.CONTAINER_MAIN);
        this._includeBlocks();

        this._state.included = true;
    }

    setExercises() {
        if (!this._state.included) {throw new Error("Cannot set any exercises, include first")}

        this._blocks.bars.mission.setExercises(["text1", "text2", "text3", "text4"]);
        this._blocks.bars.mission.setExerciseActive(1);
        this._blocks.bars.mission.setExerciseActive(2);

        this._blocks.bars.lesson.setMissions([
            {exerciseCount: 2},
            {exerciseCount: 3},
            {exerciseCount: 4},
            {exerciseCount: 1},
            {exerciseCount: 1},
            {exerciseCount: 1},
            {exerciseCount: 1},
            {exerciseCount: 1},
            {exerciseCount: 1},
            {exerciseCount: 1},
            {exerciseCount: 1},
            {exerciseCount: 1},
        ]);

        LessonBarBlock.runStyle();

        this._blocks.bars.lesson.onClick(data => {
            console.log('ONCLICK', data);
        });

        this._blocks.bars.lesson.setMissionActive(2);
        this._blocks.bars.lesson.setMissionActive(3);
        this._blocks.bars.lesson.setMissionActive(4);
        this._blocks.bars.lesson.setMissionActive(5);

        this._blocks.bars.lesson.setMissionProgress(0, 1);
        this._blocks.bars.lesson.setMissionProgress(1, 1);
        this._blocks.bars.lesson.setMissionProgress(2, 1);
        this._blocks.bars.lesson.setMissionProgress(3, 1);
        this._blocks.bars.lesson.setMissionProgress(4, 1);
        this._blocks.bars.lesson.setMissionProgress(5, 1);
        this._blocks.bars.lesson.setMissionProgress(6, 1);
        this._blocks.bars.lesson.setMissionProgress(7, 1);
        this._blocks.bars.lesson.setMissionProgress(8, 1);
        this._blocks.bars.lesson.setMissionProgress(9, 2);
    }

    /**
     * Скомпоновать дерево контейнеров
     *
     * @param parent_node
     * @param containers
     * @private
     */
    _composeContainers(parent_node, containers, parent_name) {
        if (!parent_node) {throw new TypeError("Parent DOM Node is not defined")}

        for (let container_id in containers) {
            let class_name = parent_name + "-" + container_id;

            let div = document.createElement("div");
            div.classList = class_name;

            if (typeof containers[container_id] === "object") {
                this._composeContainers(div, containers[container_id], class_name);
                containers[container_id].self = div;
            } else {
                containers[container_id] = div;
            }

            parent_node.appendChild(div);
        }
    }

    /**
     * Встроить блоки в контейнеры
     *
     * Контейнеры должны быть скомпонованы прежде, чем
     * эта функция будет вызвана
     *
     * @private
     */
    _includeBlocks() {
        this._blocks.bars.mission.include(this._containers.south.center);
        this._blocks.bars.lesson.include(this._containers.north.center.front.center);
        this._blocks.flipper.include(
            this._containers.north.center.self,
            this._containers.north.center.front.self,
            this._containers.north.center.top.self,
        );
    }
}

export default LessonPane;