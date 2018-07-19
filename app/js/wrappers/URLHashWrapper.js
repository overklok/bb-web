import Wrapper from "../core/Wrapper";

const HASH_TYPES = {
    GOTO: "goto",
    DEMO: "demo",
    FULL: "full",

    NONE: "none",
};

const REGEXPS = {
    MISSION_EXERCISE:   /^#m[0-9]+e[0-9]+$/g,
    MISSION:            /^#m[0-9]+$/g,
    EXERCISE:           /^#e[0-9]+$/g,

    NUMBERS:            /[0-9]+/g,

    DEMO:               /^#d+$/g,
    FULL:               /^#f+$/g,
};

export default class URLHashWrapper extends Wrapper {
    constructor() {
        super();
    }

    parse(hash) {
        if (typeof hash !== "string") {throw new TypeError("URL Hash is not a string")}

        let mission_idx, exercise_idx;

        if (hash.match(REGEXPS.MISSION_EXERCISE)) {
            [mission_idx, exercise_idx] = hash.match(REGEXPS.NUMBERS);
        }

        else if (hash.match(REGEXPS.MISSION)) {
            mission_idx = hash.match(REGEXPS.NUMBERS);
        }

        else if (hash.match(REGEXPS.EXERCISE)) {
            exercise_idx = hash.match(REGEXPS.NUMBERS);
        }

        else if (hash.match(REGEXPS.DEMO)) {
            return {type: HASH_TYPES.DEMO}
        }

        else if (hash.match(REGEXPS.FULL)) {
            return {type: HASH_TYPES.FULL}
        }

        else {
            return {
                type: HASH_TYPES.NONE,
            }
        }

        return {
            type: HASH_TYPES.GOTO,
            data: {
                missionIDX: Number(mission_idx),
                exerciseIDX: Number(exercise_idx),
            }
        };
    }
}