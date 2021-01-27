import * as Threads from "../threads";

function transpose() {
    return {from: {x: this.from.y, y: this.from.x}, to: {x: this.to.y, y: this.to.x}};
}

function checkIntersectionVariations(t1, t2, value) {
    expect(Threads.doesIntersectionExist(t1, t2)).toBe(value);
    expect(Threads.doesIntersectionExist(t2, t1)).toBe(value);

    // Transposed
    [t1, t2] = [t1, t2].map(v => transpose.call(v));
    expect(Threads.doesIntersectionExist(t1, t2)).toBe(value);
    expect(Threads.doesIntersectionExist(t2, t1)).toBe(value);
}

describe('doesIntersectionExist', () => {
    it('throws an exception if threads has different orientations', () => {
        let thr_1 = {from: {x: 0, y: 0}, to: {x: 0, y: 5}},
            thr_2 = {from: {x: 1, y: 1}, to: {x: 5, y: 1}};

        expect(() => {Threads.doesIntersectionExist(thr_1, thr_2)}).toThrow();

        // Transposed
        [thr_1, thr_2] = [thr_1, thr_2].map(v => transpose.call(v));
        expect(() => {Threads.doesIntersectionExist(thr_1, thr_2)}).toThrow();
    });

    it('returns false if threads lies on different lanes', () => {
        checkIntersectionVariations(
            {from: {x: 0, y: 0}, to: {x: 0, y: 5}},
            {from: {x: 1, y: 0}, to: {x: 1, y: 5}},
            false
        );
    });

    /**
     *   | ---------        --------- |
     */
    it('returns false if threads lies on the same lane but there is a gap between them', () => {
        // Full positive
        checkIntersectionVariations(
            {from: {x: 0, y: 0}, to: {x: 4, y: 0}},
            {from: {x: 5, y: 0}, to: {x: 9, y: 0}},
            false
        );

        // Full negative
        checkIntersectionVariations(
            {from: {x:  0, y: 0}, to: {x: -4, y: 0}},
            {from: {x: -5, y: 0}, to: {x: -9, y: 0}},
            false
        );

        // Partially negative
        checkIntersectionVariations(
            {from: {x: -5, y: 0}, to: {x: 5, y: 0}},
            {from: {x:  6, y: 0}, to: {x: 9, y: 0}},
            false
        );
    });

    /**
     *   | -------------             |
     *   |             ------------- |
     */
    it('returns false if threads are connected in a single point', () => {
        // Full positive
        checkIntersectionVariations(
            {from: {x: 0, y: 0}, to: {x: 4, y: 0}},
            {from: {x: 4, y: 0}, to: {x: 8, y: 0}},
            false
        );

        // Full negative
        checkIntersectionVariations(
            {from: {x:  0, y: 0}, to: {x: -4, y: 0}},
            {from: {x: -4, y: 0}, to: {x: -8, y: 0}},
            false
        );

        // Partially negative
        checkIntersectionVariations(
            {from: {x: -5, y: 0}, to: {x: -1, y: 0}},
            {from: {x: -1, y: 0}, to: {x:  5, y: 0}},
            false
        );
    });

    /**
     *   | ----------------          |
     *   |           --------------- |
     */
    it('returns true if one of the threads partially overlays another', () => {
        // Full positive
        checkIntersectionVariations(
           {from: {x: 0, y: 0}, to: {x: 5, y: 0}},
           {from: {x: 3, y: 0}, to: {x: 9, y: 0}},
           true
        );

        // Full negative
        checkIntersectionVariations(
           {from: {x:  0, y: 0}, to: {x: -5, y: 0}},
           {from: {x: -3, y: 0}, to: {x: -9, y: 0}},
           true
        );

        // Partially negative
        checkIntersectionVariations(
           {from: {x: -2, y: 0}, to: {x: 5, y: 0}},
           {from: {x:  3, y: 0}, to: {x: 9, y: 0}},
           true
        );
    });

    /**
     *   |      ---------------      |
     *   |      ---------------      |
     */
    it('returns true if both threads are the same', () => {
        // Full positive
        checkIntersectionVariations(
            {from: {x: 2, y: 0}, to: {x: 7, y: 0}},
            {from: {x: 2, y: 0}, to: {x: 7, y: 0}},
            true
        );

        // Full negative
        checkIntersectionVariations(
            {from: {x: -2, y: 0}, to: {x: -7, y: 0}},
            {from: {x: -2, y: 0}, to: {x: -7, y: 0}},
           true
        );

        // Partially negative
        checkIntersectionVariations(
            {from: {x: -2, y: 0}, to: {x: 2, y: 0}},
            {from: {x: -2, y: 0}, to: {x: 2, y: 0}},
           true
        );
    });
})