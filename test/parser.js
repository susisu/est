/*
 * est : test : parser.js
 * copyright (c) 2016 Susisu
 */

"use strict";

const chai   = require("chai");
const expect = chai.expect;

const est    = require("../index.js");
const expr   = est.expr;
const parser = est.parser;

describe("parser", () => {
    describe("parse(name, src)", () => {
        it("should parse 'src' and return the result", () => {
            {
                const e = parser.parse("test", "256");
                expect(e.equals(
                    new expr.Literal(0, 256)
                )).to.be.true;
            }
            {
                const e = parser.parse("test", "1.23e-4");
                expect(e.equals(
                    new expr.Literal(0, 1.23e-4)
                )).to.be.true;
            }
            {
                const e = parser.parse("test", "NaN");
                expect(Number.isNaN(e.value)).to.be.true;
            }
            {
                const e = parser.parse("test", "Infinity");
                expect(e.equals(
                    new expr.Literal(0, Infinity)
                )).to.be.true;
            }
            {
                const e = parser.parse("test", "x");
                expect(e.equals(
                    new expr.Variable(0, "x")
                )).to.be.true;
            }
            {
                const e = parser.parse("test", "op +");
                expect(e.equals(
                    new expr.Variable(0, "+")
                )).to.be.true;
            }
            {
                const e = parser.parse("test", "f x y");
                expect(e.equals(
                    new expr.Apply(0,
                        new expr.Apply(0, new expr.Variable(0, "f"), new expr.Variable(0, "x")),
                        new expr.Variable(0, "y")
                    )
                )).to.be.true;
            }
            {
                const e = parser.parse("test", "let x = f y in z");
                expect(e.equals(
                    new expr.Let(0,
                        "x", new expr.Apply(0, new expr.Variable(0, "f"), new expr.Variable(0, "y")),
                        new expr.Variable(0, "z")
                    )
                )).to.be.true;
            }
            {
                const e = parser.parse("test", "x + y * z");
                expect(e.equals(
                    new expr.Apply(0,
                        new expr.Apply(0, new expr.Variable(0, "+"), new expr.Variable(0, "x")),
                        new expr.Apply(0,
                            new expr.Apply(0, new expr.Variable(0, "*"), new expr.Variable(0, "y")),
                            new expr.Variable(0, "z")
                        )
                    )
                )).to.be.true;
            }
            {
                const e = parser.parse("test", "[]");
                expect(e.equals(
                    new expr.Vector(0, [])
                )).to.be.true;
            }
            {
                const e = parser.parse("test", "[256, x, let y = 128 in z]");
                expect(e.equals(
                    new expr.Vector(0, [
                        new expr.Literal(0, 256),
                        new expr.Variable(0, "x"),
                        new expr.Let(0,
                            "y", new expr.Literal(0, 128),
                            new expr.Variable(0, "z")
                        )
                    ])
                )).to.be.true;
            }
            {
                const e = parser.parse("test", `
                    let x = 256 # comment
                    in f x
                `);
                expect(e.equals(
                    new expr.Let(0,
                        "x", new expr.Literal(0, 256),
                        new expr.Apply(0, new expr.Variable(0, "f"), new expr.Variable(0, "x"))
                    )
                )).to.be.true;
            }
            expect(() => parser.parse("test", "")).to.throw(parser.ParseError);
            expect(() => parser.parse("test", "1_000_000")).to.throw(parser.ParseError);
            expect(() => parser.parse("test", "op x")).to.throw(parser.ParseError);
            expect(() => parser.parse("test", "x +")).to.throw(parser.ParseError);
            expect(() => parser.parse("test", "x ??? y")).to.throw(parser.ParseError);
            expect(() => parser.parse("test", "let x in x")).to.throw(parser.ParseError);
            expect(() => parser.parse("test", "[1, 2, 3,]")).to.throw(parser.ParseError);
        });
    });
});
