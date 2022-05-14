async function sleep(ms: number): Promise<void> {await new Promise(r => setTimeout(r, ms))}
async function waitAnimationFrame(): Promise<void> {await new Promise(resolve => { requestAnimationFrame(resolve); })}

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

/**
* Returns the index of the last element in the array where predicate is true, and -1
* otherwise.
* @param array The source array to search in
* @param predicate find calls predicate once for each element of the array, in descending
* order, until it finds one where predicate returns true. If such an element is found,
* findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
*/
export function findLastIndex<T>(array: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean): number {
    let l = array.length;
    while (l--) {
        if (predicate(array[l], l, array))
            return l;
    }
    return -1;
}

export {
    sleep, 
    clamp, 
    assert, 
    waitAnimationFrame,
    getClassNameAlias, 
    camelCaseToUnderscores, 
    cumulativeOffset, 
    scrollTo
};