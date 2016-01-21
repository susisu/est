/*
 * est : expr.js
 * copyright (c) 2016 Susisu
 */

"use strict";

function endModule() {
    module.exports = Object.freeze({
        Context: Context,

        Expression: Expression,
        Literal   : Literal,
        Vector    : Vector,
        Variable  : Variable,
        Apply     : Apply,
        Let       : Let
    });    
}

class Context {
    constructor(soughts, bounds) {
        this.soughts = soughts;
        this.bounds  = bounds;
    }

    static empty() {
        return new Context([], Object.create(null));
    }

    seek(expr) {
        for (var sought of this.soughts) {
            if (expr.equals(sought)) {
                return sought;
            }
        }
        this.soughts.push(expr);
        return expr;
    }

    bind(name, expr) {
        var local = Object.create(this.bounds);
        local[name] = expr;
        return new Context(this.soughts, local);
    }

    find(name) {
        return this.bounds[name];
    }
}

class Expression {
    constructor(pos) {
        this.pos = pos;
    }

    toString() {
        return "?";
    }

    equals(expr) {
        throw new Error("unknown expression");
    }

    optimise(context) {
        throw new Error("unknown expression");
    }
}

class Literal extends Expression {
    constructor(pos, value) {
        super(pos);
        this.value = value;
    }

    toString() {
        return this.value.toString();
    }

    equals(expr) {
        return expr instanceof Literal
            && this.value === expr.value;
    }

    optimise(context) {
        return context.seek(this);
    }
}

class Vector extends Expression {
    constructor(pos, elems) {
        super(pos);
        this.elems = elems;
    }

    toString() {
        return "[" + this.elems.map(elem => elem.toString()).join(",") + "]";
    }

    equals(expr) {
        return expr instanceof Vector
            && this.elems.length === expr.elems.length
            && this.elems.every((elem, i) => elem.equals(expr.elems[i]));
    }

    optimise(context) {
        return context.seek(
            new Vector(this.pos, this.elems.map(elem => elem.optimise(context)))
        );
    }
}

class Variable extends Expression {
    constructor(pos, name) {
        super(pos);
        this.name = name;
    }

    toString() {
        return this.name;
    }

    equals(expr) {
        return expr instanceof Variable
            && this.name === expr.name;
    }

    optimise(context) {
        var bound = context.find(this.name);
        if (bound === undefined) {
            return context.seek(this);
        }
        else {
            return bound;
        }
    }
}

class Apply extends Expression {
    constructor(pos, func, arg) {
        super(pos);
        this.func = func;
        this.arg  = arg;
    }

    toString() {
        if (this.arg instanceof Literal || this.arg instanceof Vector || this.arg instanceof Variable) {
            return this.func.toString() + " " + this.arg.toString();
        }
        else {
            return this.func.toString() + " (" + this.arg.toString() + ")";
        }
    }

    equals(expr) {
        return expr instanceof Apply
            && this.func.equals(expr.func)
            && this.arg.equals(expr.arg);
    }

    optimise(context) {
        return context.seek(
            new Apply(this.pos, this.func.optimise(context), this.arg.optimise(context))
        );
    }
}

class Let extends Expression {
    constructor(pos, name, expr, body) {
        super(pos);
        this.name = name;
        this.expr = expr;
        this.body = body;
    }

    toString() {
        return "let " + this.name + " = " + this.expr.toString() + " in " + this.body.toString();
    }

    equals(expr) {
        return expr instanceof Let
            && this.name === expr.name
            && this.expr.equals(expr.expr)
            && this.body.equals(expr.body);
    }

    optimise(context) {
        return this.body.optimise(
            context.bind(this.name, this.expr.optimise(context))
        );
    }
}

endModule();
