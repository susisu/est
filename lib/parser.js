/*
 * est : parser.js
 * copyright (c) 2016 Susisu
 */

"use strict";

function endModule() {
    module.exports = Object.freeze({
        "parse"     : parse,
        "ParseError": ParseError
    });
}

const lq = require("loquat");

const expr = require("./expr.js");

const langDef = new lq.LanguageDef(
    "",
    "",
    "#",
    false,
    lq.letter.or(lq.char("$")),
    lq.alphaNum.or(lq.oneOf("_'$")),
    lq.oneOf("+-*/%^=<>&|!"),
    lq.oneOf("+-*/%^=<>&|!"),
    ["NaN", "Infinity", "op", "let", "in"],
    ["="],
    true
);
const tp = lq.makeTokenParser(langDef);

const rwOp  = tp.reserved("op");
const rwLet = tp.reserved("let");
const rwIn  = tp.reserved("in");
const roEq  = tp.reservedOp("=");

const number = lq.gen(function* () {
    const pos = yield lq.getPosition;
    const nf  = yield tp.naturalOrFloat;
    return new expr.Literal(pos, nf.length > 1 ? nf[1] : nf[0]);
}).label("number");
const nan = lq.gen(function* () {
    const pos = yield lq.getPosition;
    yield tp.reserved("NaN");
    return new expr.Literal(pos, NaN);
}).label("number");
const infinity = lq.gen(function* () {
    const pos = yield lq.getPosition;
    yield tp.reserved("Infinity");
    return new expr.Literal(pos, Infinity);
}).label("number");

const vecElems = lq.lazy(() => tp.brackets(tp.commaSep(expression)));
const vector = lq.gen(function* () {
    const pos   = yield lq.getPosition;
    const elems = yield vecElems;
    return new expr.Vector(pos, elems);
}).label("vector");

const literal = lq.lazy(() => lq.choice([
    number,
    nan,
    infinity,
    vector
])).label("literal");

const variable = lq.gen(function* () {
    const pos  = yield lq.getPosition;
    const name = yield tp.identifier;
    return new expr.Variable(pos, name);
}).label("variable");

const operator = lq.gen(function* () {
    const pos = yield lq.getPosition;
    yield rwOp;
    const name = yield tp.operator;
    return new expr.Variable(pos, name);
}).label("variable");

const appExpr = lq.lazy(() => lq.choice([
    literal,
    variable,
    operator,
    tp.parens(expression).label("")
]));

const appArgs = appExpr.many();
const application = lq.gen(function* () {
    const func = yield appExpr;
    const args = yield appArgs;
    return args.reduce((f, arg) => new expr.Apply(arg.pos, f, arg), func);
});

const binding = lq.gen(function* () {
    const pos = yield lq.getPosition;
    yield rwLet;
    const name = yield tp.identifier;
    yield roEq;
    const bound = yield expression;
    yield rwIn;
    const body = yield expression;
    return new expr.Let(pos, name, bound, body);
}).label("let-in");

const operand = lq.lazy(() => lq.choice([
    application,
    binding
]));

function unaryOp(opName, varName) {
    const op = tp.reservedOp(opName);
    return lq.gen(function* () {
        const pos = yield lq.getPosition;
        yield op;
        return function (x) {
            return new expr.Apply(x.pos, new expr.Variable(pos, varName), x);
        };
    });
}

function binaryOp(opName) {
    const op = tp.reservedOp(opName);
    return lq.gen(function* () {
        const pos = yield lq.getPosition;
        yield op;
        return function (x, y) {
            return new expr.Apply(x.pos, new expr.Apply(y.pos, new expr.Variable(pos, opName), x), y);
        };
    });
}

const expression = lq.lazy(() => lq.buildExpressionParser(
    [
        [
            new lq.Operator(
                lq.OperatorType.PREFIX,
                unaryOp("+", "+_")
            ),
            new lq.Operator(
                lq.OperatorType.PREFIX,
                unaryOp("-", "-_")
            )
        ],
        [
            new lq.Operator(
                lq.OperatorType.INFIX,
                binaryOp("!"),
                lq.OperatorAssoc.ASSOC_LEFT
            )
        ],
        [
            new lq.Operator(
                lq.OperatorType.INFIX,
                binaryOp("**"),
                lq.OperatorAssoc.ASSOC_LEFT
            )
        ],
        [
            new lq.Operator(
                lq.OperatorType.INFIX,
                binaryOp("*"),
                lq.OperatorAssoc.ASSOC_LEFT
            ),
            new lq.Operator(
                lq.OperatorType.INFIX,
                binaryOp("/"),
                lq.OperatorAssoc.ASSOC_LEFT
            ),
            new lq.Operator(
                lq.OperatorType.INFIX,
                binaryOp("%"),
                lq.OperatorAssoc.ASSOC_LEFT
            )
        ],
        [
            new lq.Operator(
                lq.OperatorType.INFIX,
                binaryOp("+"),
                lq.OperatorAssoc.ASSOC_LEFT
            ),
            new lq.Operator(
                lq.OperatorType.INFIX,
                binaryOp("-"),
                lq.OperatorAssoc.ASSOC_LEFT
            )
        ]
    ],
    operand
));

const program = lq.gen(function* () {
    yield tp.whiteSpace;
    const e = yield expression;
    yield lq.eof;
    return e;
});

class ParseError {
    constructor(error) {
        this.error = error;
    }

    get pos() {
        return this.error.pos;
    }

    toString() {
        return "Parse Error: " + this.error.toString();
    }
}

function parse(name, src) {
    const res = lq.parse(program, name, src, 8);
    if (res.succeeded) {
        return res.value;
    }
    else {
        throw new ParseError(res.error);
    }
}

endModule();
