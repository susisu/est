/*
 * est : est.js
 * copyright (c) 2016 Susisu
 */

"use strict";

var value  = require("./value.js"),
    expr   = require("./expr.js"),
    parser = require("./parser.js"),
    lib    = require("./lib.js");

module.exports = Object.freeze({
    value : value,
    expr  : expr,
    parser: parser,
    lib   : lib,

    parse  : parser.parse,
    prelude: lib.prelude
});
