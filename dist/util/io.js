'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.writeJson = exports.readJson = exports.clear = exports.writeln = exports.write = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Concatenate and write arbitrary strings to stdout.
 *
 * @param  {...string}  things
 */
var write = exports.write = function write() {
  for (var _len = arguments.length, things = Array(_len), _key = 0; _key < _len; _key++) {
    things[_key] = arguments[_key];
  }

  things.forEach(function (thing) {
    process.stdout.write(thing);
  });
};

/**
 * Same thing as __write, but adds a newline afterward.
 *
 * @param  {...string}  things
 */
var writeln = exports.writeln = function writeln() {
  write.apply(undefined, arguments);
  process.stdout.write('\n');
};

/**
 * Clears the current line.
 */
var clear = exports.clear = function clear() {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
};

/**
 * Load a file and parse it as JSON.
 *
 * @param  {string}  path
 * @return {*|boolean}
 */
var readJson = exports.readJson = function readJson(path) {
  try {
    return JSON.parse(_fs2.default.readFileSync(path, { encoding: 'utf8' }));
  } catch (e) {
    return false;
  }
};

/**
 * Write an object to a file as JSON.
 *
 * @param   {string}  path
 * @param   {*}       data
 * @return  {boolean}
 */
var writeJson = exports.writeJson = function writeJson(path, data) {
  try {
    _fs2.default.writeFileSync(path, JSON.stringify(data), { encoding: 'utf8' });
    return true;
  } catch (e) {
    return false;
  }
};