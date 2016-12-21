// TODO:
// - add method applyClasses(meta, classes) - current, disabled, separator
// - write tests
// - write docs
// - write comments to build bounds
// - write demo
// - upload to npm

(function () {
    'use strict';

    var defaultOptions = {
        arrows: true,
        maxSize: 11,

        take: 10,
        current: 1
    };

    var errors = {
        unableCalcCount: 'Unable to calculate pages count. Ensure that "itemsCount" and "take" values are numbers.',
        notSupported: 'Not supported enviroment'
    };

    var utils = {
        mergeOptions: mergeOptions
    };

    var calc = {
        count: calcCount,
        bounds: calcBounds
    };

    var generate = {
        pages: generatePages,
        flat: generateFlat,
        full: generateFull
    };

    var metaPagination = {
        get: function (userOptions) {
            var meta = utils.mergeOptions(defaultOptions, userOptions);

            meta.pagesCount = calc.count(meta.itemsCount, meta.take);
            meta.pages = generate.pages(meta, calc.bounds(meta));

            return meta;
        }
    };

    if (typeof window !== 'undefined') {
        window.MetaPagination = metaPagination;
    } else if (typeof module !== 'undefined') {
        module.exports = metaPagination;
    } else {
        throw new Error(errors.notSupported);
    }

    function mergeOptions(defaultOptions, userOptions) {
        var options = {}, prop;

        for (prop in defaultOptions) {
            if (!defaultOptions.hasOwnProperty(prop)) continue;

            options[prop] = defaultOptions[prop];
        }

        for (prop in userOptions) {
            if (!userOptions.hasOwnProperty(prop)) continue;

            options[prop] = userOptions[prop];
        }

        return options;
    }

    function calcCount(itemsCount, take) {
        var pagesCount = Math.ceil(itemsCount / take);

        if (isNaN(pagesCount)) {
            throw new Error(errors.unableCalcCount);
        }

        return pagesCount;
    }

    function calcBounds(meta) {
        if (meta.pagesCount === 1) return;

        var cellsLeft, cellsRight, lo, hi;

        if (meta.maxSize % 2 === 0) {
            cellsLeft = meta.maxSize / 2 - 1;
            cellsRight = meta.maxSize / 2;
        }
        else {
            cellsLeft = (meta.maxSize - 1) / 2;
            cellsRight = (meta.maxSize - 1) / 2;
        }

        if (meta.arrows) {
            cellsLeft--;
            cellsRight--;
        }

        if (meta.current > cellsLeft + 1) cellsLeft--;
        if (meta.current > cellsLeft + 1) cellsLeft--;
        if (meta.current < meta.pagesCount - cellsRight) cellsRight--;
        if (meta.current < meta.pagesCount - cellsRight) cellsRight--;

        lo = meta.current - cellsLeft;
        hi = meta.current + cellsRight;

        if (lo < 1) {
            hi += 1 - lo;
            lo = 1;
        }

        if (hi > meta.pagesCount) {
            lo -= hi - meta.pagesCount;
            hi = meta.pagesCount;
        }

        return {
            lo: lo,
            hi: hi
        };
    }

    function generatePages(meta, bounds) {
        var list = (meta.arrows && meta.pagesCount <= meta.maxSize - 2)
                    || (!meta.arrows && meta.pagesCount <= meta.maxSize)
            ? this.flat(meta)
            : this.full(meta, bounds);

        if (meta.arrows) {
            list.unshift({ type: 'prev', value: '<' });
            list.push({ type: 'next', value: '>' });
        }

        return list;
    }

    function generateFlat(meta) {
        var list = [];

        for (var i = 1; i <= meta.pagesCount; i++) {
            list.push({ type: 'page', value: i });
        }

        return list;
    }

    function generateFull(meta, bounds) {
        var list = [];

        if (bounds.lo > 1) {
            list.push({ type: 'page', value: 1 });
        }

        if (bounds.lo > 2) {
            list.push({ type: 'separator', value: '...' });
        }

        for (var i = bounds.lo; i <= bounds.hi ; i++) {
            if (i <= 0 || i > meta.pagesCount) continue;
            list.push({ type: 'page', value: i })
        }

        if (bounds.hi < meta.pagesCount - 1) {
            list.push({ type: 'separator', value: '...' })
        }

        if (bounds.hi < meta.pagesCount) {
            list.push({ type: 'page', value: meta.pagesCount });
        }

        return list;
    }
})();




