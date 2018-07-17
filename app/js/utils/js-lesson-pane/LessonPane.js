import MissionBarBlock from "./blocks/bars/MissionBarBlock";
import LessonBarBlock from "./blocks/bars/LessonBarBlock";
import MenuBarBlock from "./blocks/bars/MenuBarBlock";
import LessonChipBlock from "./blocks/chips/LessonChipBlock";
import MenuChipBlock from "./blocks/chips/MenuChipBlock";
import TaskChipBlock from "./blocks/chips/TaskChipBlock";
import FlipperBlock from "./blocks/FlipperBlock";
import StatusChipBlock from "./blocks/chips/StatusChipBlock";

import thm from "./styles/containers/lesson-pane.css";

const CLASEES = {
    CONTAINER_MAIN: "lesson-pane",
    CONTAINER_MAIN_EMPH: "lesson-pane-emph"
};

class NotIncludedError extends Error {
    constructor(...args) {
        super(...args);
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, NotIncludedError);
        }

        this.code = "ENOCON";
    }
}

export default class LessonPane {
    constructor(emphasize=false) {
        this._container = undefined;
        this._emphasized = emphasize;

        this._containers = {
            north: {
                west: undefined,
                center: {
                    front: {
                        west: undefined,
                        center: undefined,
                        east: undefined,
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
                lesson: new LessonChipBlock(),
                menu: new MenuChipBlock(),
                task: new TaskChipBlock(),
                status: new StatusChipBlock()
            },

            flipper: new FlipperBlock()
        };

        this._callbacks = {
            onmissionclick: (idx) => {},
            onmenuclick: () => {},
        };

        this._state = {
            included: false,
            missions: undefined,
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
        this._container.classList.add(CLASEES.CONTAINER_MAIN);
        if (this._emphasized) {
            this._container.classList.add(CLASEES.CONTAINER_MAIN_EMPH);
        }

        dom_node.appendChild(this._container);

        this._composeContainers(this._container, this._containers, CLASEES.CONTAINER_MAIN);
        this._includeBlocks();

        this._state.included = true;
        this._state.missions = [];

        this._attachHandlers();
    }

    setMissions(missions) {
        if (!this._state.included) {throw new NotIncludedError("Cannot set any missions, include first")}

        this._blocks.bars.lesson.setMissions(missions);

        this._state.missions = missions;

        LessonBarBlock.runStyle();
    }

    setExercises(exercises) {
        if (!this._state.included) {throw new NotIncludedError("Cannot set any exercises, include first")}

        this._blocks.bars.mission.setExercises(exercises);
    }

    setLogoText(text) {
        if (!this._state.included) {throw new NotIncludedError("Cannot set logo text, include first")}

        this._blocks.chips.lesson.setTextLogo(text);
    }

    setLessonText(text) {
        if (!this._state.included) {throw new NotIncludedError("Cannot set lesson text, include first")}

        this._blocks.chips.lesson.setTextMeta(text);
    }

    setTaskText(text) {
        if (!this._state.included) {throw new NotIncludedError("Cannot set task text, include first")}

        this._blocks.chips.task.setText(text);
    }

    setExerciseActive(exercise_idx) {
        if (!this._state.included) {throw new NotIncludedError("Cannot set active exercise, include first")}

        this._blocks.bars.mission.setExerciseActive(exercise_idx);
        this._blocks.bars.mission.displayProgress(exercise_idx);
    }

    setMissionActive(mission_idx) {
        if (!this._state.included) {throw new NotIncludedError("Cannot set active mission, include first")}

        this._blocks.bars.lesson.setMissionActive(mission_idx);
        this._blocks.bars.lesson.setMissionSkidding(mission_idx, false);
    }

    setMissionSkidding(mission_idx, skidding=false) {
        if (!this._state.included) {throw new NotIncludedError("Cannot set skidding mission, include first")}

        this._blocks.bars.lesson.setMissionSkidding(mission_idx, skidding);
    }

    setMissionProgress(mission_idx, exercises_passed_count) {
        if (!this._state.included) {throw new NotIncludedError("Cannot set mission progress, include first")}

        this._blocks.bars.lesson.setMissionProgress(mission_idx, exercises_passed_count);
    }

    setStatusSuccess() {
        if (!this._state.included) {throw new NotIncludedError("Cannot set status, include first")}

        this._blocks.chips.status.setSuccess();
    }

    setStatusWarning() {
        if (!this._state.included) {throw new NotIncludedError("Cannot set status, include first")}

        this._blocks.chips.status.setWarning();
    }

    setStatusError() {
        if (!this._state.included) {throw new NotIncludedError("Cannot set status, include first")}

        this._blocks.chips.status.setError();
    }

    setStatusActive() {
        if (!this._state.included) {throw new NotIncludedError("Cannot set status, include first")}

        this._blocks.chips.status.setActive();
    }

    setStatusDefault() {
        if (!this._state.included) {throw new NotIncludedError("Cannot set status, include first")}

        this._blocks.chips.status.setDefault();
    }

    setMenuStructure(structure) {
        if (!this._state.included) {throw new NotIncludedError("Cannot set menu structure, include first")}

        this._blocks.bars.menu.setStructure(structure);
    }

    showTask() {
        if (!this._state.included) {throw new NotIncludedError("Cannot set menu structure, include first")}

        this._blocks.bars.mission.fit();
        this._blocks.chips.task.show();
    }

    hideTask() {
        if (!this._state.included) {throw new NotIncludedError("Cannot set menu structure, include first")}

        this._blocks.chips.task.hide();
        this._blocks.bars.mission.stretch();
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

    onMissionClick(cb) {
        this._callbacks.onmissionclick = cb;
    }

    onMenuClick(cb) {
        this._callbacks.onmenuclick = cb;
    }

    switchMenu(on) {
        this._blocks.flipper.showSide(on ? 'top' : 'front');
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
        this._blocks.bars.menu.include(this._containers.north.center.top.center);
        this._blocks.flipper.include(
            this._containers.north.center.self,
            this._containers.north.center.front.self,
            this._containers.north.center.top.self,
        );

        this._blocks.chips.lesson.include(this._containers.north.center.front.west);
        this._blocks.chips.task.include(this._containers.south.west);
        this._blocks.chips.menu.include(this._containers.north.west);
        this._blocks.chips.status.include(this._containers.north.center.front.east);
    }

    _attachHandlers() {
        this._blocks.chips.menu.onClick(pressed => {
            this._blocks.flipper.showSide(pressed ? 'top' : 'front');
        });

        this._blocks.bars.lesson.onClick(data => {
            this._callbacks.onmissionclick(data);
        });
    }
}
