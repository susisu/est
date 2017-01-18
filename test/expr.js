/*
 * est : test : expr.js
 * copyright (c) 2016 Susisu
 */

"use strict";

const chai   = require("chai");
const expect = chai.expect;

const est   = require("../index.js");
const value = est.value;
const expr  = est.expr;

describe("expr", () => {
    describe("Context", () => {
        describe(".empty()", () => {
            it("should create a new empty context", () => {
                const ctx = expr.Context.empty();
                expect(ctx.soughts).to.deep.equal([]);
                expect(ctx.bounds).to.deep.equal({});
                expect(Object.getPrototypeOf(ctx.bounds)).to.equal(null);
            });
        });

        describe("#seek(expr)", () => {
            it("should add 'expr' to 'context.soughts' and return it if there is no same expression", () => {
                const ctx = expr.Context.empty();
                const e = new expr.Literal(0, "test");
                const s = ctx.seek(e);
                expect(s).to.equal(e);
                expect(ctx.soughts).to.deep.equal([e]);
            });

            it("should return the same expression as 'expr' if it is in 'context.soughts'", () => {
                const ctx = expr.Context.empty();
                const e1 = new expr.Literal(0, "test");
                ctx.seek(e1);
                const e2 = new expr.Literal(0, "test");
                const s = ctx.seek(e2);
                expect(s).to.equal(e1);
                expect(ctx.soughts).to.deep.equal([e1]);
            });
        });

        describe("#bind(name, expr)", () => {
            it("should return a new context in which 'expr' is bounded to 'name'", () => {
                const ctx1 = expr.Context.empty();
                const e1 = new expr.Literal(0, "test");
                const ctx2 = ctx1.bind("x", e1);
                expect(ctx1.bounds).to.deep.equal({});
                expect(ctx2.bounds).to.deep.equal({ "x": e1 });
            });
        });

        describe("#find(name)", () => {
            it("should return the expression that is bounded to 'name'", () => {
                const ctx1 = expr.Context.empty();
                const e1 = new expr.Literal(0, "test");
                const ctx2 = ctx1.bind("x", e1);
                const f1 = ctx2.find("x");
                expect(f1).to.equal(e1);

                const e2 = new expr.Literal(0, 256);
                const ctx3 = ctx2.bind("x", e2);
                const f2 = ctx3.find("x");
                const f3 = ctx2.find("x");
                expect(f2).to.equal(e2);
                expect(f3).to.equal(e1);
            });

            it("should return undefined if there is no bound expression", () => {
                const ctx = expr.Context.empty();
                const e = ctx.find("x");
                expect(e).to.be.undefined;
            });
        });
    });

    describe("Expression", () => {
        describe("#toString()", () => {
            it("should return \"?\"", () => {
                const e = new expr.Expression(0);
                expect(e.toString()).to.equal("?");
            });
        });

        describe("#equals(expr)", () => {
            it("should throw an error", () => {
                const e = new expr.Expression(0);
                expect(() => { e.equals(e); }).to.throw();
            });
        });

        describe("#optimise_(context)", () => {
            it("should throw an error", () => {
                const ctx = expr.Context.empty();
                const e = new expr.Expression(0);
                expect(() => { e.optimise_(ctx); }).to.throw();
            });
        });

        describe("#eval_(env)", () => {
            it("should throw an error", () => {
                const env = Object.create(null);
                const e = new expr.Expression(0);
                expect(() => { e.eval_(env); }).to.throw(value.RuntimeError);
            });
        });

        describe("#eval(env)", () => {
            it("should evaluate the expression and cache the result", () => {
                const env = Object.create(null);
                const e = new expr.Literal(0, 256);
                const r = e.eval(env);
                expect(r).to.equal(256);
                expect(e.result).to.equal(256);

                e.eval_ = () => { throw "should not be called"; };
                expect(() => {
                    const r = e.eval(env);
                    expect(r).to.equal(256);
                }).not.to.throw();
            });
        });
    });

    describe("Literal", () => {
        describe("#toString()", () => {
            it("should return a string that represents its value", () => {
                const e = new expr.Literal(0, 256);
                expect(e.toString()).to.equal("256");
            });
        });

        describe("#equals(expr)", () => {
            it("should return true if 'expr' is a Literal and its value is equal", () => {
                const e1 = new expr.Literal(0, 256);
                const e2 = new expr.Literal(1, 256);
                expect(e1.equals(e2)).to.be.true;

                const e3 = new expr.Literal(0, 256);
                const e4 = new expr.Literal(1, 128);
                expect(e3.equals(e4)).to.be.false;

                const e5 = new expr.Literal(0, 256);
                const e6 = new expr.Variable(1, "x");
                expect(e5.equals(e6)).to.be.false;
            });
        });

        describe("#optimise_(context)", () => {
            it("should return the optimised expression with 'context'", () => {
                const ctx = expr.Context.empty();
                let e1 = new expr.Literal(0, 256);
                e1 = e1.optimise_(ctx);
                const e2 = new expr.Literal(1, 256);
                const e3 = new expr.Literal(2, 128);
                expect(e2.optimise_(ctx)).to.equal(e1);
                expect(e3.optimise_(ctx)).to.equal(e3);
            });
        });

        describe("#eval_(env)", () => {
            it("should return the value", () => {
                const env = Object.create(null, {
                    x: { value: 256 }
                });
                const e = new expr.Literal(0, 256);
                expect(e.eval(env)).to.equal(256);
            });
        });
    });

    describe("Vector", () => {
        describe("#toString()", () => {
            it("should return a string that represents its elements", () => {
                const e = new expr.Vector(0, [
                    new expr.Literal(1, 256),
                    new expr.Variable(2, "x")
                ]);
                expect(e.toString()).to.equal("[256, x]");
            });
        });

        describe("#equals(expr)", () => {
            it("should return true if 'expr' is a Vector and its all elements are equal", () => {
                const e1 = new expr.Vector(0, [
                    new expr.Literal(1, 256),
                    new expr.Variable(2, "x")
                ]);
                const e2 = new expr.Vector(3, [
                    new expr.Literal(4, 256),
                    new expr.Variable(5, "x")
                ]);
                expect(e1.equals(e2)).to.be.true;

                const e3 = new expr.Vector(0, [
                    new expr.Literal(1, 256),
                    new expr.Variable(2, "x")
                ]);
                const e4 = new expr.Vector(3, [
                    new expr.Literal(4, 256),
                    new expr.Variable(5, "y")
                ]);
                expect(e3.equals(e4)).to.be.false;

                const e5 = new expr.Vector(0, [
                    new expr.Literal(1, 256),
                    new expr.Variable(2, "x")
                ]);
                const e6 = new expr.Vector(3, [
                    new expr.Literal(4, 256)
                ]);
                expect(e5.equals(e6)).to.be.false;

                const e7 = new expr.Vector(0, [
                    new expr.Literal(1, 256),
                    new expr.Variable(2, "x")
                ]);
                const e8 = new expr.Literal(3, 256);
                expect(e7.equals(e8)).to.be.false;
            });
        });

        describe("#optimise_(context)", () => {
            it("should return the optimised expression with 'context'", () => {
                const ctx = expr.Context.empty();
                let e1 = new expr.Vector(0, [
                    new expr.Literal(1, 256),
                    new expr.Variable(2, "x")
                ]);
                e1 = e1.optimise_(ctx);
                const e2 = new expr.Vector(3, [
                    new expr.Literal(4, 256),
                    new expr.Variable(5, "x")
                ]);
                const e3 = new expr.Vector(6, [
                    new expr.Literal(7, 256)
                ]);
                expect(e2.optimise_(ctx)).to.equal(e1);
                expect(e3.optimise_(ctx).equals(
                    new expr.Vector(-1, [
                        new expr.Literal(-1, 256)
                    ])
                )).to.be.true;
                expect(e3.optimise_(ctx)).not.to.equal(e3);
            });
        });

        describe("#eval_(env)", () => {
            it("should return a vector (array) that contains the evaluated elements", () => {
                const env = Object.create(null, {
                    x: { value: 256 }
                });
                const e1 = new expr.Vector(0, [
                    new expr.Literal(1, 128),
                    new expr.Variable(2, "x")
                ]);
                expect(e1.eval(env)).to.deep.equal([128, 256]);

                const e2 = new expr.Vector(0, [
                    new expr.Literal(1, 128),
                    new expr.Variable(2, "y")
                ]);
                expect(() => { e2.eval(env); }).to.throw(value.RuntimeError);
            });
        });
    });

    describe("Variable", () => {
        describe("#toString()", () => {
            it("should return a string that represents its name", () => {
                const e = new expr.Variable(0, "x");
                expect(e.toString()).to.equal("x");
            });
        });

        describe("#equals(expr)", () => {
            it("should return true if 'expr' is a Variable and its name is same", () => {
                const e1 = new expr.Variable(0, "x");
                const e2 = new expr.Variable(1, "x");
                expect(e1.equals(e2)).to.be.true;

                const e3 = new expr.Variable(0, "x");
                const e4 = new expr.Variable(1, "y");
                expect(e3.equals(e4)).to.be.false;

                const e5 = new expr.Variable(0, "x");
                const e6 = new expr.Literal(1, 256);
                expect(e5.equals(e6)).to.be.false;
            });
        });

        describe("#optimise_(context)", () => {
            it("should return the optimised expression with 'context'", () => {
                let ctx = expr.Context.empty();
                let e1 = new expr.Variable(0, "x");
                e1 = e1.optimise_(ctx);
                const e2 = new expr.Variable(1, "x");
                const e3 = new expr.Variable(2, "y");
                expect(e2.optimise_(ctx)).to.equal(e1);
                expect(e3.optimise_(ctx)).to.equal(e3);

                const e = new expr.Literal(3, 256);
                ctx = ctx.bind("x", e);
                expect(e1.optimise_(ctx)).to.equal(e);
                expect(e2.optimise_(ctx)).to.equal(e);
                expect(e3.optimise_(ctx)).to.equal(e3);
            });
        });

        describe("#eval_(env)", () => {
            it("should return the value bound to the name in 'env'", () => {
                const env = Object.create(null, {
                    x: { value: 256 }
                });
                const e1 = new expr.Variable(0, "x");
                expect(e1.eval_(env)).to.equal(256);

                const e2 = new expr.Variable(1, "y");
                expect(() => { e2.eval_(env); }).to.throw(value.RuntimeError);
            });
        });
    });

    describe("Apply", () => {
        describe("#toString()", () => {
            it("should return a string that represents it", () => {
                const e1 = new expr.Apply(0,
                    new expr.Variable(1, "f"),
                    new expr.Variable(2, "x")
                );
                expect(e1.toString()).to.equal("f x");

                const e2 = new expr.Apply(0,
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
                const e1 = new expr.Apply(0,
                    new expr.Variable(1, "f"),
                    new expr.Variable(2, "x")
                );
                const e2 = new expr.Apply(3,
                    new expr.Variable(4, "f"),
                    new expr.Variable(5, "x")
                );
                expect(e1.equals(e2)).to.be.true;

                const e3 = new expr.Apply(0,
                    new expr.Variable(1, "f"),
                    new expr.Variable(2, "x")
                );
                const e4 = new expr.Apply(3,
                    new expr.Variable(4, "f"),
                    new expr.Variable(5, "y")
                );
                expect(e3.equals(e4)).to.be.false;

                const e5 = new expr.Apply(0,
                    new expr.Variable(1, "f"),
                    new expr.Variable(2, "x")
                );
                const e6 = new expr.Variable(3, "y");
                expect(e5.equals(e6)).to.be.false;
            });
        });

        describe("#optimise_(context)", () => {
            it("should return the optimised expression with 'context'", () => {
                const ctx = expr.Context.empty();
                let e1 = new expr.Apply(0,
                    new expr.Variable(1, "f"),
                    new expr.Variable(2, "x")
                );
                e1 = e1.optimise_(ctx);
                const e2 = new expr.Apply(3,
                    new expr.Variable(4, "f"),
                    new expr.Variable(5, "x")
                );
                const e3 = new expr.Apply(0,
                    new expr.Variable(1, "f"),
                    new expr.Variable(2, "y")
                );
                expect(e2.optimise_(ctx)).to.equal(e1);
                expect(e3.optimise_(ctx).equals(
                    new expr.Apply(-1,
                        new expr.Variable(-1, "f"),
                        new expr.Variable(-1, "y")
                    )
                )).to.be.true;
                expect(e3.optimise_(ctx)).not.to.equal(e3);
            });
        });

        describe("#eval_(env)", () => {
            it("should return the result of the application", () => {
                const env = Object.create(null, {
                    x: { value: 256 }
                });
                const e1 = new expr.Apply(0,
                    new expr.Literal(1, x => 2 * x),
                    new expr.Variable(2, "x")
                );
                expect(e1.eval_(env)).to.equal(512);

                const e2 = new expr.Apply(0,
                    new expr.Literal(1, x => 2 * x),
                    new expr.Variable(2, "y")
                );
                expect(() => { e2.eval_(env); }).to.throw(value.RuntimeError);

                const e3 = new expr.Apply(0,
                    new expr.Literal(1, 128),
                    new expr.Variable(2, "x")
                );
                expect(() => { e3.eval_(env); }).to.throw(value.RuntimeError);
            });
        });
    });

    describe("Let", () => {
        describe("#toString()", () => {
            it("should return a string that represents it", () => {
                const e = new expr.Let(0,
                    "x", new expr.Literal(1, 256),
                    new expr.Variable(2, "y")
                );
                expect(e.toString()).to.equal("let x = 256 in y");
            });
        });

        describe("#equals(expr)", () => {
            it("should return true if 'expr' is a Let and its name, bound expression, and body are same", () => {
                const e1 = new expr.Let(0,
                    "x", new expr.Literal(1, 256),
                    new expr.Variable(2, "y")
                );
                const e2 = new expr.Let(3,
                    "x", new expr.Literal(4, 256),
                    new expr.Variable(5, "y")
                );
                expect(e1.equals(e2)).to.be.true;

                const e3 = new expr.Let(0,
                    "x", new expr.Literal(1, 256),
                    new expr.Variable(2, "y")
                );
                const e4 = new expr.Let(3,
                    "x", new expr.Literal(4, 256),
                    new expr.Variable(5, "z")
                );
                expect(e3.equals(e4)).to.be.false;

                const e5 = new expr.Let(0,
                    "x", new expr.Literal(1, 256),
                    new expr.Variable(2, "y")
                );
                const e6 = new expr.Literal(1, 256);
                expect(e5.equals(e6)).to.be.false;
            });
        });

        describe("#optimise_(context)", () => {
            it("should return the optimised expression with 'context'", () => {
                const ctx = expr.Context.empty();
                const v1 = new expr.Variable(2, "y");
                let e1 = new expr.Let(0,
                    "x", new expr.Literal(1, 256),
                    v1
                );
                e1 = e1.optimise_(ctx);
                expect(e1).to.equal(v1);
                const e2 = new expr.Let(3,
                    "x", new expr.Literal(4, 256),
                    new expr.Variable(5, "y")
                );
                expect(e2.optimise_(ctx)).to.equal(v1);

                const e3 = new expr.Let(6,
                    "x", new expr.Literal(7, 256),
                    new expr.Vector(8, [
                        new expr.Variable(9, "x"),
                        new expr.Variable(10, "x")
                    ])
                );
                expect(e3.optimise_(ctx).equals(
                    new expr.Vector(8, [
                        new expr.Literal(-1, 256),
                        new expr.Literal(-1, 256)
                    ])
                )).to.be.true;
            });
        });

        describe("#eval_(env)", () => {
            it("should return the result of the evaluation of 'body' where 'expr' is bound to 'name'", () => {
                const env = Object.create(null, {
                    x: { value: 256 }
                });
                const e1 = new expr.Let(0,
                    "y", new expr.Literal(1, 128),
                    new expr.Variable(2, "x")
                );
                expect(e1.eval_(env)).to.equal(256);

                const e2 = new expr.Let(0,
                    "x", new expr.Literal(1, 128),
                    new expr.Variable(2, "x")
                );
                expect(e2.eval_(env)).to.equal(128);

                const e3 = new expr.Let(0,
                    "x", new expr.Literal(1, 128),
                    new expr.Variable(2, "y")
                );
                expect(() => { e3.eval_(env); }).to.throw(value.RuntimeError);
            });
        });
    });
});
