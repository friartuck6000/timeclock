"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Round the given date to the closest multiple of <nearest>, based on the
 * given <midpoint>.
 *
 * @param  {Date}    date
 * @param  {number}  nearest
 * @param  {number}  midpoint
 */
var roundMinutes = exports.roundMinutes = function roundMinutes(date, nearest, midpoint) {
  var realMinutes = date.getMinutes();
  var remainder = realMinutes % nearest;
  var diff = nearest - remainder;
  var rounded = remainder > midpoint ? realMinutes + diff : realMinutes - remainder;

  date.setMinutes(rounded, 0, 0);
};