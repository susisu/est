/*
 * est : test : value.js
 * copyright (c) 2016 Susisu
 */

"use strict";

var chai   = require("chai"),
    expect = chai.expect;

var est   = require("../index.js"),
    value = est.value;

describe("value", () => {
    describe("typeOf(value)", () => {
        it("should return the corresponding type string of the value", () => {
            expect(value.typeOf(256)).to.equal(value.Type.NUMBER);
            expect(value.typeOf("test")).to.equal(value.Type.STRING);
            expect(value.typeOf(true)).to.equal(value.Type.BOOL);
            expect(value.typeOf(() => {})).to.equal(value.Type.FUNCTION);
            expect(value.typeOf([])).to.equal(value.Type.VECTOR);
            expect(() => { value.typeOf({}); }).to.throw();
            expect(() => { value.typeOf(undefined); }).to.throw();
        });
    });
});
