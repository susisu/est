# est
The easiest way to calculate something.

## Installation
Node.js v4.0 or later is required.
``` shell
npm install -g @susisu/est
```

## Usage
### Synopsis
```
est [options] ['prog' | -p progfile] [files ...]
```

### Examples
``` shell
$ cat foo.txt
# comments
1   2   3
4   5   6
7   8   9
$ est '$1' foo.txt
1
4
7
$ est 'sum $1' foo.txt
12
$ est '2 * $1' foo.txt
2
8
14
$ est '[$1, $2, $1 + $2]' foo.txt
1   2   3
4   5   9
7   8   15
$ cat bar.txt
1.0e-1
1.0
1.0e+1
$ est '$$1!2 * $$2!1' foo.txt bar.txt
0.2
5
80
```

### Program syntax
The syntax is very simple:

* Numbers: `123`, `6.02e+23`, ...
* Vectors: `[123, 456]`, ...
* Variables: `x`, `sum`, `PI`, `$1`, `op+` ...
* Functions: `sqrt 3.14`, `log_ 3 9`, `x + y`, ...
* Local bindings: `let x = sum [1, 2, 3] in 2 * x`, ...

NOTE: `f x + y` is recognized as `(f x) + y`, not `f (x + y)`.

### Predefined variables
* Constants: `PI`, `E`, `LN2`, `LN10`, `LOG2E`, `LOG10E`, `SQRT1_2`, `SQRT2`
* Unary functions: `+`, `-`, `abs`, `round`, `floor`, `ceil`, `sqrt`, `exp`, `log`, `log2`, `log10`, `sin`, `cos`, `tan`, `asin`, `acos`, `atan`
* Binary functions: `+`, `-`, `*`, `/`, `%`, `**`, `log_`, `atan_`
* Vector operation functions: index access `!`, `len`, `fst`, `sum`, `prod`, `avg`, `var`, `stddev`, `stderr`

The input data are bound to `$$1`...`$$N` and the columns of the first data are bound to `$1`...`$N`.
The transposed input (the rows are the original columns, and vice versa) are also bound to `$$T1`...`$$TN`.

The unary and binary functions are automatically mapped if applied to vector.

### Options
* `-e`, `--encoding <code>`: set encoding of input files (default = utf8)
* `-f`, `--format <name>: set fromat type (default = table)
* `-p`, `--program <file>`: read program from `file`
* `-t`, `--transpose`: transpose output
* `-x`, `--exponential`: output numbers in exponential notation
* `-E`, `--extension <file>`: load JavaScript extension; multiple extensions are allowed

## License
[The MIT License](http://opensource.org/licenses/mit-license.php)

## Author
Susisu ([GitHub](https://github.com/susisu), [Twitter](https://twitter.com/susisu2413))
