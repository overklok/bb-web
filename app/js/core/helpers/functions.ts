async function sleep(ms: number): Promise<void> {await new Promise(r => setTimeout(r, ms))}

function coverOptions(options: {[key: string]: any}, defaults: {[key: string]: any}): {[key: string]: any} {
    const result: {[key: string]: any} = {};

    if (!defaults) defaults = {};

    /// Если не заданы опции - выдать опции по умолчанию
    if (typeof options === "undefined") return defaults;

    /// Если options - массив, то возвратить копию значения
    if (Array.isArray(options)) return [...options];

    /// Если options - не объект, то возвратить копию значения
    if (typeof options !== 'object') return options;

    /// Для каждой заданной опции выполнить рекурсивно поиск опции
    for (const option_key of Object.keys(defaults)) {
        result[option_key] = coverOptions(options[option_key], defaults[option_key]);
    }

    for (const option_key of Object.keys(options)) {
        // if (option_key in Object.keys(defaults)) continue;
        if (Object.keys(defaults).indexOf(option_key) > -1) continue;
        if (typeof options[option_key] === "undefined") continue;
        result[option_key] = coverOptions(options[option_key], {});
    }

    return result;
}

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