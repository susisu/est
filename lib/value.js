/*
 * est : value.js
 * copyright (c) 2016 Susisu
 */

"use strict";

function endModule() {
    module.exports = Object.freeze({
        Type        : Type,
        typeOf      : typeOf,
        RuntimeError: RuntimeError
    });
}

var Type = Object.freeze({
    NUMBER  : "number",
    STRING  : "string",
    BOOL    : "bool",
    FUNCTION: "function",
    VECTOR  : "vector"
});

function typeOf(value) {
    switch (typeof value) {
    case "number":
        return Type.NUMBER;
    case "string":
        return Type.STRING;
    case "boolean":
        return Type.BOOL;
    case "function":
        return Type.FUNCTION;
    case "object":
        if (value instanceof Array) {
            return Type.VECTOR;
        }
    default:
        throw new Error("unknown value");
    }
}

class RuntimeError {
    constructor(trace, message) {
        this.trace   = trace;
        this.message = message;
    }

    static referenceError(pos, name) {
        return new RuntimeError(
            pos === undefined ? [] : [pos],
            "Reference Error: " + name + " is not defined"
        );
    }

    static typeError(pos, expected, actual) {
        return new RuntimeError(
            pos === undefined ? [] : [pos],
            "Type Error: expected " + expected + ", actual " + actual
        );
    }

    toString() {
        if (this.trace.length === 0) {
            return this.message;
        }
        else {
            return this.trace.map(pos => pos.toString() + ":\n").reverse().join("") + this.message;
        }
    }

    addPosition(pos) {
        return new RuntimeError(this.trace.concat(pos), this.message);
    }
}

endModule();
