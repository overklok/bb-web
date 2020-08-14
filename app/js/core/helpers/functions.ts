async function sleep(ms: number): Promise<void> {await new Promise(r => setTimeout(r, ms))}

function coverOptions(options: {[key: string]: any}, defaults: {[key: string]: any}): {[key: string]: any} {
    const result: {[key: string]: any} = {};

    if (!defaults) defaults = {};

    /// Если не заданы опции - выдать опции по умолчанию
    if (typeof options === "undefined") return defaults;

    /// Если options - не объект, то возвратить значение
    if (typeof options !== 'object' || Array.isArray(options)) return options;

    /// Для каждой заданной опции выполнить рекурсивно поиск опции
    for (const option_key of Object.keys(defaults)) {
        result[option_key] = coverOptions(options[option_key], defaults[option_key]);
    }

    for (const option_key of Object.keys(options)) {
        if (option_key in Object.keys(defaults)) continue;
        if (typeof options[option_key] === "undefined") continue;
        result[option_key] = coverOptions(options[option_key], {});
    }

    return result;
}

export {sleep, coverOptions};