/*
 * est : est.js
 * copyright (c) 2016 Susisu
 */

"use strict";

const value  = require("./value.js");
const expr   = require("./expr.js");
const parser = require("./parser.js");
const lib    = require("./lib.js");

module.exports = Object.freeze({
    value : value,
    expr  : expr,
    parser: parser,
    lib   : lib,

    parse  : parser.parse,
    prelude: lib.prelude
});
