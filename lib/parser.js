/*
 * est : parser.js
 * copyright (c) 2016 Susisu
 */

"use strict";

function endModule() {
    module.exports = Object.freeze({
        "parse": parse
    });
}

var lq = require("loquat");

var expr = require("./expr.js");

var langDef = new lq.LanguageDef(
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
var tp = lq.makeTokenParser(langDef);

var rwOp  = tp.reserved("op");
var rwLet = tp.reserved("let");
var rwIn  = tp.reserved("in");
var roEq  = tp.reservedOp("=");

var number = lq.gen(function * () {
    var pos = yield lq.getPosition;
    var nf  = yield tp.naturalOrFloat;
    return new expr.Literal(pos, nf.length > 1 ? nf[1] : nf[0]);
}).label("number");
var nan = lq.gen(function * () {
    var pos = yield lq.getPosition;
    yield tp.reserved("NaN");
    return new expr.Literal(pos, NaN);
}).label("number");
var infinity = lq.gen(function * () {
    var pos = yield lq.getPosition;
    yield tp.reserved("Infinity");
    return new expr.Literal(pos, Infinity);
}).label("number");

var vecElems = lq.lazy(() => tp.brackets(tp.commaSep(expression)));
var vector = lq.gen(function * () {
    var pos   = yield lq.getPosition;
    var elems = yield vecElems;
    return new expr.Vector(pos, elems);
}).label("vector");

var literal = lq.lazy(() => lq.choice([
    number,
    nan,
    infinity,
    vector
])).label("literal");

var variable = lq.gen(function * () {
    var pos  = yield lq.getPosition;
    var name = yield tp.identifier;
    return new expr.Variable(pos, name);
}).label("variable");

var operator = lq.gen(function * () {
    var pos = yield lq.getPosition;
    yield rwOp;
    var name = yield tp.operator;
    return new expr.Variable(pos, name);
}).label("variable");

var appExpr = lq.lazy(() => lq.choice([
    literal,
    variable,
    operator,
    tp.parens(expression).label("")
]));

var appArgs = appExpr.many();
var application = lq.gen(function * () {
    var func = yield appExpr;
    var args = yield appArgs;
    return args.reduce((f, arg) => new expr.Apply(arg.pos, f, arg), func);
});

var binding = lq.gen(function * () {
    var pos = yield lq.getPosition;
    yield rwLet;
    var name = yield tp.identifier;
    yield roEq;
    var bound = yield expression;
    yield rwIn;
    var body = yield expression;
    return new expr.Let(pos, name, bound, body);
}).label("let-in");

var operand = lq.lazy(() => lq.choice([
    application,
    binding
]));

function unaryOp(opName, varName) {
    var op = tp.reservedOp(opName);
    return lq.gen(function * () {
        var pos = yield lq.getPosition;
        yield op;
        return function (x) {
            return new expr.Apply(x.pos, new expr.Variable(pos, varName), x);
        };
    });
};

function binaryOp(opName) {
    var op = tp.reservedOp(opName);
    return lq.gen(function * () {
        var pos = yield lq.getPosition;
        yield op
        return function (x, y) {
            return new expr.Apply(x.pos, new expr.Apply(y.pos, new expr.Variable(pos, opName), x), y);
        }
    });
};

var expression = lq.lazy(() => lq.buildExpressionParser(
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
            ),
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

var program = lq.gen(function * () {
    yield tp.whiteSpace;
    var e = yield expression;
    yield lq.eof;
    return e;
});

function parse(name, src) {
    var res = lq.parse(program, name, src, 8);
    if (res.succeeded) {
        return res.value;
    }
    else {
        throw res.error;
    }
}

endModule();
