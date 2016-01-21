/*
 * est : test : expr.js
 * copyright (c) 2016 Susisu
 */

"use strict";

var chai   = require("chai"),
    expect = chai.expect;

var est  = require("../index.js"),
    expr = est.expr;

describe("expr", () => {
    describe("Context", () => {
        describe(".empty()", () => {
            it("should create a new empty context", () => {
                var ctx = expr.Context.empty();
                expect(ctx.soughts).to.deep.equal([]);
                expect(ctx.bounds).to.deep.equal({});
                expect(Object.getPrototypeOf(ctx.bounds)).to.equal(null);
            });
        });

        describe("#seek(expr)", () => {
            it("should add 'expr' to 'context.soughts' and return it if there is no same expression", () => {
                var ctx = expr.Context.empty();
                var e = new expr.Literal(0, "test");
                var s = ctx.seek(e);
                expect(s).to.equal(e);
                expect(ctx.soughts).to.deep.equal([e]);
            });

            it("should return the same expression as 'expr' if it is in 'context.soughts'", () => {
                var ctx = expr.Context.empty();
                var e1 = new expr.Literal(0, "test");
                ctx.seek(e1);
                var e2 = new expr.Literal(0, "test");
                var s = ctx.seek(e2);
                expect(s).to.equal(e1);
                expect(ctx.soughts).to.deep.equal([e1]);
            });
        });

        describe("#bind(name, expr)", () => {
            it("should return a new context in which 'expr' is bounded to 'name'", () => {
                var ctx1 = expr.Context.empty();
                var e1 = new expr.Literal(0, "test");
                var ctx2 = ctx1.bind("x", e1);
                expect(ctx1.bounds).to.deep.equal({});
                expect(ctx2.bounds).to.deep.equal({ "x": e1 });
            });
        });

        describe("#find(name)", () => {
            it("should return the expression that is bounded to 'name'", () => {
                var ctx1 = expr.Context.empty();
                var e1 = new expr.Literal(0, "test");
                var ctx2 = ctx1.bind("x", e1);
                var f1 = ctx2.find("x");
                expect(f1).to.equal(e1);

                var e2 = new expr.Literal(0, 256);
                var ctx3 = ctx2.bind("x", e2);
                var f2 = ctx3.find("x");
                var f3 = ctx2.find("x");
                expect(f2).to.equal(e2);
                expect(f3).to.equal(e1);
            });

            it("should return undefined if there is no bound expression", () => {
                var ctx = expr.Context.empty();
                var e = ctx.find("x");
                expect(e).to.be.undefined;
            });
        });
    });

    describe("Expression", () => {
        describe("#toString()", () => {
            it("should return \"?\"", () => {
                var e = new expr.Expression(0);
                expect(e.toString()).to.equal("?");
            });
        });

        describe("#equals(expr)", () => {
            it("should throw an error", () => {
                var e = new expr.Expression(0);
                expect(() => { e.equals(e); }).to.throw();
            });
        });

        describe("#optimise(context)", () => {
            it("should throw an error", () => {
                var ctx = expr.Context.empty();
                var e = new expr.Expression(0);
                expect(() => { e.optimise(ctx); }).to.throw();
            });
        });
    });

    describe("Literal", () => {
        describe("#toString()", () => {
            it("should return a string that represents its value", () => {
                var e = new expr.Literal(0, 256);
                expect(e.toString()).to.equal("256");
            });
        });

        describe("#equals(expr)", () => {
            it("should return true if 'expr' is a Literal and its value is equal", () => {
                var e1 = new expr.Literal(0, 256);
                var e2 = new expr.Literal(1, 256);
                expect(e1.equals(e2)).to.be.true;

                var e3 = new expr.Literal(0, 256);
                var e4 = new expr.Literal(1, 128);
                expect(e3.equals(e4)).to.be.false;

                var e5 = new expr.Literal(0, 256);
                var e6 = new expr.Variable(1, "x");
                expect(e5.equals(e6)).to.be.false;
            });
        });

        describe("#optimise(context)", () => {
            it("should return the optimised expression with 'context'", () => {
                var ctx = expr.Context.empty();
                var e1 = new expr.Literal(0, 256);
                e1 = e1.optimise(ctx);
                var e2 = new expr.Literal(1, 256);
                var e3 = new expr.Literal(2, 128);
                expect(e2.optimise(ctx)).to.equal(e1);
                expect(e3.optimise(ctx)).to.equal(e3);
            });
        });
    });

    describe("Vector", () => {
        describe("#toString()", () => {
            it("should return a string that represents its elements", () => {
                var e = new expr.Vector(0, [
                    new expr.Literal(1, 256),
                    new expr.Variable(2, "x")
                ]);
                expect(e.toString()).to.equal("[256,x]");
            });
        });

        describe("#equals(expr)", () => {
            it("should return true if 'expr' is a Vector and its all elements are equal", () => {
                var e1 = new expr.Vector(0, [
                    new expr.Literal(1, 256),
                    new expr.Variable(2, "x")
                ]);
                var e2 = new expr.Vector(3, [
                    new expr.Literal(4, 256),
                    new expr.Variable(5, "x")
                ]);
                expect(e1.equals(e2)).to.be.true;

                var e3 = new expr.Vector(0, [
                    new expr.Literal(1, 256),
                    new expr.Variable(2, "x")
                ]);
                var e4 = new expr.Vector(3, [
                    new expr.Literal(4, 256),
                    new expr.Variable(5, "y")
                ]);
                expect(e3.equals(e4)).to.be.false;

                var e5 = new expr.Vector(0, [
                    new expr.Literal(1, 256),
                    new expr.Variable(2, "x")
                ]);
                var e6 = new expr.Vector(3, [
                    new expr.Literal(4, 256)
                ]);
                expect(e5.equals(e6)).to.be.false;

                var e7 = new expr.Vector(0, [
                    new expr.Literal(1, 256),
                    new expr.Variable(2, "x")
                ]);
                var e8 = new expr.Literal(3, 256);
                expect(e7.equals(e8)).to.be.false;
            });
        });

        describe("#optimise(context)", () => {
            it("should return the optimised expression with 'context'", () => {
                var ctx = expr.Context.empty();
                var e1 = new expr.Vector(0, [
                    new expr.Literal(1, 256),
                    new expr.Variable(2, "x")
                ]);
                e1 = e1.optimise(ctx);
                var e2 = new expr.Vector(3, [
                    new expr.Literal(4, 256),
                    new expr.Variable(5, "x")
                ]);
                var e3 = new expr.Vector(6, [
                    new expr.Literal(7, 256)
                ]);
                expect(e2.optimise(ctx)).to.equal(e1);
                expect(e3.optimise(ctx).equals(
                    new expr.Vector(-1, [
                        new expr.Literal(-1, 256)
                    ])
                )).to.be.true;
                expect(e3.optimise(ctx)).not.to.equal(e3);
            });
        });
    });

    describe("Variable", () => {
        describe("#toString()", () => {
            it("should return a string that represents its name", () => {
                var e = new expr.Variable(0, "x");
                expect(e.toString()).to.equal("x");
            });
        });

        describe("#equals(expr)", () => {
            it("should return true if 'expr' is a Variable and its name is same", () => {
                var e1 = new expr.Variable(0, "x");
                var e2 = new expr.Variable(1, "x");
                expect(e1.equals(e2)).to.be.true;

                var e3 = new expr.Variable(0, "x");
                var e4 = new expr.Variable(1, "y");
                expect(e3.equals(e4)).to.be.false;

                var e5 = new expr.Variable(0, "x");
                var e6 = new expr.Literal(1, 256);
                expect(e5.equals(e6)).to.be.false;
            });
        });

        describe("#optimise(context)", () => {
            it("should return the optimised expression with 'context'", () => {
                var ctx = expr.Context.empty();
                var e1 = new expr.Variable(0, "x");
                e1 = e1.optimise(ctx);
                var e2 = new expr.Variable(1, "x");
                var e3 = new expr.Variable(2, "y");
                expect(e2.optimise(ctx)).to.equal(e1);
                expect(e3.optimise(ctx)).to.equal(e3);

                var e = new expr.Literal(3, 256);
                ctx = ctx.bind("x", e);
                expect(e1.optimise(ctx)).to.equal(e);
                expect(e2.optimise(ctx)).to.equal(e);
                expect(e3.optimise(ctx)).to.equal(e3);
            });
        });
    });

    describe("Apply", () => {
        describe("#toString()", () => {
            it("should return a string that represents it", () => {
                var e1 = new expr.Apply(0,
                    new expr.Variable(1, "f"),
                    new expr.Variable(2, "x")
                );
                expect(e1.toString()).to.equal("f x");

                var e2 = new expr.Apply(0,
                    new expr.Variable(1, "f"),
                    new expr.Apply(2,
                        new expr.Variable(3, "x"),
                        new expr.Variable(3, "y")
                    )
                );
                expect(e2.toString()).to.equal("f (x y)");
            });
        });

        describe("#equals(expr)", () => {
            it("should return true if 'expr' is an Apply and its 'func' and 'arg' are equal", () => {
                var e1 = new expr.Apply(0,
                    new expr.Variable(1, "f"),
                    new expr.Variable(2, "x")
                );
                var e2 = new expr.Apply(3,
                    new expr.Variable(4, "f"),
                    new expr.Variable(5, "x")
                );
                expect(e1.equals(e2)).to.be.true;

                var e3 = new expr.Apply(0,
                    new expr.Variable(1, "f"),
                    new expr.Variable(2, "x")
                );
                var e4 = new expr.Apply(3,
                    new expr.Variable(4, "f"),
                    new expr.Variable(5, "y")
                );
                expect(e3.equals(e4)).to.be.false;

                var e5 = new expr.Apply(0,
                    new expr.Variable(1, "f"),
                    new expr.Variable(2, "x")
                );
                var e6 = new expr.Variable(3, "y");
                expect(e5.equals(e6)).to.be.false;
            });
        });

        describe("#optimise(context)", () => {
            it("should return the optimised expression with 'context'", () => {
                var ctx = expr.Context.empty();
                var e1 = new expr.Apply(0,
                    new expr.Variable(1, "f"),
                    new expr.Variable(2, "x")
                );
                e1 = e1.optimise(ctx);
                var e2 = new expr.Apply(3,
                    new expr.Variable(4, "f"),
                    new expr.Variable(5, "x")
                );
                var e3 = new expr.Apply(0,
                    new expr.Variable(1, "f"),
                    new expr.Variable(2, "y")
                );
                expect(e2.optimise(ctx)).to.equal(e1);
                expect(e3.optimise(ctx).equals(
                    new expr.Apply(-1,
                        new expr.Variable(-1, "f"),
                        new expr.Variable(-1, "y")
                    )
                )).to.be.true;
                expect(e3.optimise(ctx)).not.to.equal(e3);
            });
        });
    });

    describe("Let", () => {
        describe("#toString()", () => {
            it("should return a string that represents it", () => {
                var e = new expr.Let(0,
                    "x", new expr.Literal(1, 256),
                    new expr.Variable(2, "y")
                );
                expect(e.toString()).to.equal("let x = 256 in y");
            });
        });

        describe("#equals(expr)", () => {
            it("should return true if 'expr' is a Let and its name, bound expression, and body are same", () => {
                var e1 = new expr.Let(0,
                    "x", new expr.Literal(1, 256),
                    new expr.Variable(2, "y")
                );
                var e2 = new expr.Let(3,
                    "x", new expr.Literal(4, 256),
                    new expr.Variable(5, "y")
                );
                expect(e1.equals(e2)).to.be.true;

                var e3 = new expr.Let(0,
                    "x", new expr.Literal(1, 256),
                    new expr.Variable(2, "y")
                );
                var e4 = new expr.Let(3,
                    "x", new expr.Literal(4, 256),
                    new expr.Variable(5, "z")
                );
                expect(e3.equals(e4)).to.be.false;

                var e5 = new expr.Let(0,
                    "x", new expr.Literal(1, 256),
                    new expr.Variable(2, "y")
                );
                var e6 = new expr.Literal(1, 256);
                expect(e5.equals(e6)).to.be.false;
            });
        });

        describe("#optimise(context)", () => {
            it("should return the optimised expression with 'context'", () => {
                var ctx = expr.Context.empty();
                var v1 = new expr.Variable(2, "y");
                var e1 = new expr.Let(0,
                    "x", new expr.Literal(1, 256),
                    v1
                );
                e1 = e1.optimise(ctx);
                expect(e1).to.equal(v1);
                var e2 = new expr.Let(3,
                    "x", new expr.Literal(4, 256),
                    new expr.Variable(5, "y")
                );
                expect(e2.optimise(ctx)).to.equal(v1);

                var e3 = new expr.Let(6,
                    "x", new expr.Literal(7, 256),
                    new expr.Vector(8, [
                        new expr.Variable(9, "x"),
                        new expr.Variable(10, "x"),
                    ])
                );
                expect(e3.optimise(ctx).equals(
                    new expr.Vector(8, [
                        new expr.Literal(-1, 256),
                        new expr.Literal(-1, 256),
                    ])
                )).to.be.true;
            });
        });
    });
});
