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
function scrollTo(element: HTMLElement, offset: number, callback: Function) {
    const fixedOffset = offset.toFixed(),
        onScroll = function () {
            if (element.scrollLeft.toFixed() === fixedOffset) {
                element.removeEventListener('scroll', onScroll);
                callback();
            }
        }

    element.addEventListener('scroll', onScroll);
    onScroll();

    element.scrollTo({
        left: offset,
        behavior: 'smooth'
    });
}

export {sleep, coverOptions, getClassNameAlias, camelCaseToUnderscores, cumulativeOffset, scrollTo};