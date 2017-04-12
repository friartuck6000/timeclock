'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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