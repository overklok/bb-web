import React, { useState, useRef, useLayoutEffect } from 'react';

// Load initial MathJax config
// Note that MathJax should be loaded after this code is executed
import './init.js';

declare class __MathJax_State__ {
    static isReady: boolean;
    static promise: Promise<any>;
}

declare class MathJax {
    static texReset(): void;
    static typeset(els?: HTMLElement[]): void;
    static typesetPromise(els?: HTMLElement[]): Promise<void>;
}

export default function ProcessMath({ children }: { children: React.ReactElement }) {
    const rootRef = useRef(null);

    const [isReady, setIsReady] = useState(__MathJax_State__.isReady);

    useLayoutEffect(() => {
        // Avoid running this script if the MathJax library hasn't loaded yet
        if (!isReady) {
            // But trigger a re-render of this component once it is loaded
            __MathJax_State__.promise.then(() => setIsReady(true));

            return;
        }

        // This element won't be null at this point
        const rootEl = rootRef.current;

        // Reset equation numbers
        MathJax.texReset();

        // Run MathJax typesetting on just this element
        // Potentially this could/should be switched to use the asynchronous version
        // of this MathJax function, `MathJax.typesetPromise()`
        MathJax.typeset([rootEl]);
    });

    return (
        <div ref={rootRef}>
            {children}
        </div>
    );
}
