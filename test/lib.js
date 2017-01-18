/*
 * est : test : lib.js
 * copyright (c) 2016 Susisu
 */

"use strict";

const chai   = require("chai");
const expect = chai.expect;

const est   = require("../index.js");
const value = est.value;
const lib   = est.lib;

describe("lib", () => {
    describe(".prelude", () => {
        const prld = lib.prelude;

        describe("pos", () => {
            it("unary +", () => {
                expect(prld["pos"](256)).to.equal(256);
                expect(prld["pos"](-256)).to.equal(-256);
                expect(prld["pos"]([256, -256])).to.deep.equal([256, -256]);
                expect(prld["pos"]([[1, -2], [-3, 4]])).to.deep.equal([[1, -2], [-3, 4]]);
                expect(() => { prld["pos"]("test"); }).to.throw(value.RuntimeError);
                expect(() => { prld["pos"](["foo", "bar"]); }).to.throw(value.RuntimeError);
            });
        });

        describe("neg", () => {
            it("unary -", () => {
                expect(prld["neg"](256)).to.equal(-256);
                expect(prld["neg"](-256)).to.equal(256);
                expect(prld["neg"]([256, -256])).to.deep.equal([-256, 256]);
                expect(prld["neg"]([[1, -2], [-3, 4]])).to.deep.equal([[-1, 2], [3, -4]]);
                expect(() => { prld["neg"]("test"); }).to.throw(value.RuntimeError);
                expect(() => { prld["neg"](["foo", "bar"]); }).to.throw(value.RuntimeError);
            });
        });
    });
});
