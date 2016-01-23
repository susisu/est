/*
 * est : lib.js
 * copyright (c) 2016 Susisu
 */

"use strict";

function endModule() {
    module.exports = Object.freeze({
        unaryOp : unaryOp,
        binaryOp: binaryOp,
        reduceOp: reduceOp,

        prelude: Object.freeze(prelude)
    })
}

var value        = require("./value.js"),
    Type         = value.Type,
    typeOf       = value.typeOf,
    RuntimeError = value.RuntimeError;

function unaryOp(argType, func) {
    return function op(x) {
        var t = typeOf(x);
        switch (t) {
        case argType:
            return func(x);
        case Type.VECTOR:
            return x.map(op);
        default:
            throw RuntimeError.typeError(undefined, argType + " or " + Type.VECTOR, t);
        }
    };
}

function binaryOp(xType, yType, func) {
    return function op(x) {
        return y => {
            var tx = typeOf(x);
            var ty = typeOf(y);
            switch (tx) {
            case xType:
                switch (ty) {
                case yType:
                    return func(x, y);
                case Type.VECTOR:
                    return y.map(z => op(x)(z));
                default:
                    throw RuntimeError.typeError(undefined, yType + " or " + Type.VECTOR, ty);
                }
            case Type.VECTOR:
                switch (ty) {
                case yType:
                    return x.map(z => op(z)(y));
                case Type.VECTOR:
                    var len = Math.min(x.length, y.length);
                    var res = new Array(len);
                    for (var i = 0; i < len; i++) {
                        res[i] = op(x[i])(y[i]);
                    }
                    return res;
                default:
                    throw RuntimeError.typeError(undefined, yType + " or " + Type.VECTOR, ty);
                }
            default:
                throw RuntimeError.typeError(undefined, xType + " or " + Type.VECTOR, tx);
            }
        };
    };
}

function reduceOp(elemType, func, init) {
    return function op(x) {
        var t = typeOf(x);
        if (t !== Type.VECTOR) {
            throw RuntimeError.typeError(undefined, Type.VECTOR, t);
        }
        var res = x.reduce(
            (acc, elem) => {
                var te = typeOf(elem);
                if (te !== elemType) {
                    throw RuntimeError.typeError(undefined, elemType, te);
                }
                return func(acc, elem);
            },
            init
        );
        return res;
    };
}

var prelude = Object.create(null);

// constatns
prelude["PI"]      = Math.PI;
prelude["E"]       = Math.E;
prelude["LN2"]     = Math.LN2;
prelude["LN10"]    = Math.LN10;
prelude["LOG2E"]   = Math.LOG2E;
prelude["LOG10E"]  = Math.LOG10E;
prelude["SQRT1_2"] = Math.SQRT1_2;
prelude["SQRT2"]   = Math.SQRT2;

// Number -> Numer
// Vector a -> Vector a
prelude["pos"]   = unaryOp(Type.NUMBER, x => +x);
prelude["neg"]   = unaryOp(Type.NUMBER, x => -x);
prelude["abs"]   = unaryOp(Type.NUMBER, x => Math.abs(x));
prelude["round"] = unaryOp(Type.NUMBER, x => Math.round(x));
prelude["floor"] = unaryOp(Type.NUMBER, x => Math.floor(x));
prelude["ceil"]  = unaryOp(Type.NUMBER, x => Math.ceil(x));
prelude["sqrt"]  = unaryOp(Type.NUMBER, x => Math.sqrt(x));
prelude["exp"]   = unaryOp(Type.NUMBER, x => Math.exp(x));
prelude["log"]   = unaryOp(Type.NUMBER, x => Math.log(x));
prelude["log2"]  = unaryOp(Type.NUMBER, x => Math.log(x) / Math.LN2);
prelude["log10"] = unaryOp(Type.NUMBER, x => Math.log(x) / Math.LN10);
prelude["sin"]   = unaryOp(Type.NUMBER, x => Math.sin(x));
prelude["cos"]   = unaryOp(Type.NUMBER, x => Math.cos(x));
prelude["tan"]   = unaryOp(Type.NUMBER, x => Math.tan(x));
prelude["asin"]  = unaryOp(Type.NUMBER, x => Math.asin(x));
prelude["acos"]  = unaryOp(Type.NUMBER, x => Math.acos(x));
prelude["atan"]  = unaryOp(Type.NUMBER, x => Math.atan(x));

// Number -> Numer -> Number
// Vector a -> Vector a -> Vector a
prelude["+"]     = binaryOp(Type.NUMBER, Type.NUMBER, (x, y) => x + y);
prelude["-"]     = binaryOp(Type.NUMBER, Type.NUMBER, (x, y) => x - y);
prelude["*"]     = binaryOp(Type.NUMBER, Type.NUMBER, (x, y) => x * y);
prelude["/"]     = binaryOp(Type.NUMBER, Type.NUMBER, (x, y) => x / y);
prelude["%"]     = binaryOp(Type.NUMBER, Type.NUMBER, (x, y) => x % y);
prelude["**"]    = binaryOp(Type.NUMBER, Type.NUMBER, (x, y) => Math.pow(x, y));
prelude["log_"]  = binaryOp(Type.NUMBER, Type.NUMBER, (x, y) => Math.log(y) / Math.log(x));
prelude["atan_"] = binaryOp(Type.NUMBER, Type.NUMBER, (x, y) => Math.atan2(x, y));

// Vector a -> Number -> a
prelude["!"] = x => y => {
    var tx = typeOf(x);
    var ty = typeOf(y);
    if (tx !== Type.VECTOR) {
        throw RuntimeError.typeError(undefined, Type.VECTOR, tx);
    }
    if (ty !== Type.NUMBER) {
        throw RuntimeError.typeError(undefined, Type.NUMBER, ty);
    }
    var len = x.length;
    var i   = Math.floor(y - 1);
    if (i < 0 || i >= len || Number.isNaN(i)) {
        throw RuntimeError.error(undefined, "index out of range");
    }
    return x[i];
};
// Vector a -> Number
prelude["len"] = x => {
    var t = typeOf(x);
    if (t !== Type.VECTOR) {
        throw RuntimeError.typeError(undefined, Type.VECTOR, t);
    }
    return x.length;
};
// Vector a -> a
prelude["fst"] = x => {
    var t = typeOf(x);
    if (t !== Type.VECTOR) {
        throw RuntimeError.typeError(undefined, Type.VECTOR, t);
    }
    var len = x.length;
    if (len === 0) {
        throw RuntimeError.error(undefined, "empty vector");
    }
    return x[0];
};

// Vector Number -> Number
prelude["sum"]  = reduceOp(Type.NUMBER, (x, y) => x + y, 0.0);
prelude["prod"] = reduceOp(Type.NUMBER, (x, y) => x * y, 1.0);
prelude["avg"] = x => {
    var t = typeOf(x);
    if (t !== Type.VECTOR) {
        throw RuntimeError.typeError(undefined, Type.VECTOR, t);
    }
    var len = x.length;
    if (len === 0) {
        throw RuntimeError.error(undefined, "empty vector");
    }
    var sum = 0.0;
    for (var i = 0; i < len; i++) {
        var ti = typeOf(x[i]);
        if (ti !== Type.NUMBER) {
            throw RuntimeError.typeError(undefined, Type.NUMBER, ti);
        }
        sum += x[i];
    }
    return sum / len;
};
prelude["var"] = x => {
    var t = typeOf(x);
    if (t !== Type.VECTOR) {
        throw RuntimeError.typeError(undefined, Type.VECTOR, t);
    }
    var len = x.length;
    if (len === 0) {
        throw RuntimeError.error(undefined, "empty vector");
    }
    var sum   = 0.0;
    var sumSq = 0.0;
    for (var i = 0; i < len; i++) {
        var ti = typeOf(x[i]);
        if (ti !== Type.NUMBER) {
            throw RuntimeError.typeError(undefined, Type.NUMBER, ti);
        }
        sum   += x[i];
        sumSq += x[i] * x[i];
    }
    var avg   = sum / len;
    var avgSq = sumSq / len;
    return avgSq - avg * avg;
};
prelude["stddev"] = x => {
    var t = typeOf(x);
    if (t !== Type.VECTOR) {
        throw RuntimeError.typeError(undefined, Type.VECTOR, t);
    }
    var len = x.length;
    if (len === 0) {
        throw RuntimeError.error(undefined, "empty vector");
    }
    var sum   = 0.0;
    var sumSq = 0.0;
    for (var i = 0; i < len; i++) {
        var ti = typeOf(x[i]);
        if (ti !== Type.NUMBER) {
            throw RuntimeError.typeError(undefined, Type.NUMBER, ti);
        }
        sum   += x[i];
        sumSq += x[i] * x[i];
    }
    var avg   = sum / len;
    var avgSq = sumSq / len;
    return Math.sqrt(avgSq - avg * avg);
}

endModule();
