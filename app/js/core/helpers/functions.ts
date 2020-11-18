import {isUndefined, partialRight, assignWith} from "lodash";

async function sleep(ms: number): Promise<void> {await new Promise(r => setTimeout(r, ms))}

type KeyValuePair = {[key: string]: any};

const coverOptions: (options: KeyValuePair, defaults: KeyValuePair) => KeyValuePair
    = partialRight(assignWith, (obj: KeyValuePair, src: KeyValuePair) => isUndefined(obj) ? src : obj);

function getClassNameAlias(class_name: string, postfix?: string) {
    if (postfix) {
        const postfix_idx = class_name.lastIndexOf(postfix);

        if (postfix_idx >= 0) {
            class_name = class_name.slice(0, postfix_idx);
        }
    }

    return camelCaseToUnderscores(class_name);
}

function camelCaseToUnderscores(str: string) {
    return str.replace(/\.?([A-Z]+)/g, function (x,y){return "_" + y.toLowerCase()})
        .replace(/^_/, "")
}

export {sleep, coverOptions, getClassNameAlias, camelCaseToUnderscores};