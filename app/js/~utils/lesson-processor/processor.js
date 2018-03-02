const EXER_TYPES = {
    CIRCUIT_ASM: 0,
    BLOCK_ASM: 1,
    BUTTON_SEQ: 2,
    COMBINED: 3,
    LOGIC_ASM: 4,
};

const EXER_SANDBOX_IGN = [
    "max_blocks", "listeners_only", "buttons_model", "verifier_model"
];

const EXER_TYPE_IGN = [
    [],
    ["buttons_model"],
    ["block_types", "max_blocks", "listeners_only", "verifier_model"],
    [],
    [],
];

let processLesson = (_lesson) => {
    if (!(_lesson.missions) || _lesson.missions.length === 0) {
        throw new Error("Lesson does not have any missions");
    }

    let missions = [];

    for (let _mission of _lesson.missions) {
        let mission = processMission(_mission);

        if (mission) missions.push(mission);
    }

    return {
        name: _lesson.name || "NONAME",
        description: _lesson.description || "NODESC",
        missions: missions
    };
};

let processMission = (_mission) => {
    if (!(_mission.exercises) || _mission.exercises.length === 0) {
        return null;
    }

    let exercises = [];

    for (let _exercise of _mission.exercises) {
        let exercise = processExercise(_exercise);

        if (exercise) exercises.push(exercise);
    }

    return {
        name: _mission.name || "NONAME",
        category: _mission.category,
        exercises: exercises
    };
};

let processExercise = (_exercise) => {
    let exercise = {};

    let type        = _exercise.type;
    let is_sandbox  = _exercise.is_sandbox || false;
    let popovers    = [];

    for (let _popover of _exercise.popovers) {
        let popover = processPopover(_popover);

        if (popover) popovers.push(popover);
    }

    if (popovers.length === 0) {popovers = null}

    /// копировать поля условно
    for (const [field, value] of Object.entries(_exercise)) {
        /// если поле не игнорируется по типу
        if (!(field in EXER_TYPE_IGN[type])) {
            /// если упражнение - не песочница и поле не игнорируется в песочнице
            if (!(is_sandbox && field in EXER_SANDBOX_IGN)) {
                exercise[field] = value;
            }
        }
    }

    exercise.popovers = popovers;
    if (exercise.buttons_model) {
        exercise.buttons_model = JSON.parse(exercise.buttons_model);
    } else {
        exercise.buttons_model = [];
    }

    return exercise;
};

let processPopover = (_popover) => {
    return {
        intro: `<h1>${_popover.title}</h1>${_popover.content}`,
        position: _popover.placement,
        element: _popover.element
    };
};

export default processLesson;