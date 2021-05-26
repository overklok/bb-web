//import isUndefined from "lodash/isUndefined";
//import partialRight from "lodash/partialRight";
import defaults from "lodash/defaults";

async function sleep(ms: number): Promise<void> {await new Promise(r => setTimeout(r, ms))}

type KeyValuePair = {[key: string]: any};

// const coverObjects: (options: KeyValuePair, defaults: KeyValuePair) => KeyValuePair
//    = partialRight(mergeWith, (obj: KeyValuePair, src: KeyValuePair) => isUndefined(obj) ? src : obj);
const coverObjects: (options: KeyValuePair, defaults: KeyValuePair) => KeyValuePair =
    (o, d) => defaults(o, d);

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

function cumulativeOffset(element: any): {top: number, left: number} {
    let top = 0, left = 0;

    do {
        top += element.offsetTop || 0;
        left += element.offsetLeft || 0;
        top -= element.scrollTop || 0;
        left -= element.scrollLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
}

/**
 * Native scrollTo with callback
 * @param offset - offset to scroll to
 * @param callback - callback function
 */
function scrollTo(element: HTMLElement, offset: number, callback?: Function) {
    const fixedOffset = offset.toFixed(),
        onScroll = function () {
            if (element.scrollLeft.toFixed() === fixedOffset) {
                element.removeEventListener('scroll', onScroll);
                callback && callback();
            }
        }

    element.addEventListener('scroll', onScroll);
    onScroll();

    element.scrollTo({
        left: offset,
        behavior: 'smooth'
    });
}

function clamp(min: number, max: number, val: number) {
    return Math.min(Math.max(val, min), max);
}

function assert(condition: any, msg?: string): asserts condition {
    if (!condition) {
        throw new Error(msg);
    }
}

export {sleep, clamp, assert, coverObjects, getClassNameAlias, camelCaseToUnderscores, cumulativeOffset, scrollTo};