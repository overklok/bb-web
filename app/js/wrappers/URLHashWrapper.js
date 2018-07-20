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

    DEMO:               /^#d$/g,
    FULL:               /^#f$/g,
    FULL_IP:            /^#f:[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/g,
    FULL_LOCAL:         /^#f:localhost$/g,
    FULL_PORT:          /^#f::[0-9]{1,5}$/g,
    FULL_IP_PORT:       /^#f:[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}:[0-9]{1,5}$/g,
    FULL_LOCAL_PORT:       /^#f:localhost:[0-9]{1,5}$/g,
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

        else if (hash.match(REGEXPS.FULL_IP)) {
            return {
                type: HASH_TYPES.FULL,
                data: {
                    address: hash.match(REGEXPS.FULL_IP)[0].slice(3)
                }
            }
        }

        else if (hash.match(REGEXPS.FULL_LOCAL)) {
            return {
                type: HASH_TYPES.FULL,
                data: {
                    address: hash.match(REGEXPS.FULL_LOCAL)[0].slice(3)
                }
            }
        }

        else if (hash.match(REGEXPS.FULL_PORT)) {
            return {
                type: HASH_TYPES.FULL,
                data: {
                    port: Number(hash.match(REGEXPS.FULL_PORT)[0].slice(4))
                }
            }
        }

        else if (hash.match(REGEXPS.FULL_IP_PORT)) {
            let [_, ip, port] = hash.match(REGEXPS.FULL_IP_PORT)[0].split(':');

            return {
                type: HASH_TYPES.FULL,
                data: {
                    address: ip,
                    port: Number(port)
                }
            }
        }

        else if (hash.match(REGEXPS.FULL_LOCAL_PORT)) {
            let [_, ip, port] = hash.match(REGEXPS.FULL_LOCAL_PORT)[0].split(':');

            return {
                type: HASH_TYPES.FULL,
                data: {
                    address: ip,
                    port: Number(port)
                }
            }
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