'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _cliTable = require('cli-table2');

var _cliTable2 = _interopRequireDefault(_cliTable);

var _clone = require('clone');

var _clone2 = _interopRequireDefault(_clone);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _config = require('../config');

var _io = require('../util/io');

var io = _interopRequireWildcard(_io);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Command state.
 */
var state = {
  cwd: null,
  data: null,
  lineItems: []
};

/**
 * Parse the contents of a timesheet.
 *
 * @param  {object}  opts  Optional parameters passed in.
 *
 * @param  {string}  opts.dir  A working directory to use (defults to the CWD).
 */
var parse = function parse(opts) {
  // Set working dir
  state.cwd = _path2.default.resolve(opts.dir || process.cwd());

  // Load JSON
  var filePath = state.cwd + '/' + _config.FILENAME;
  state.data = io.readJson(filePath);
  if (!state.data) {
    io.writeln(' -> ', _chalk2.default.red('Error reading timesheet data!'));
    process.exit(1);
  }

  // Define scaffold for line items
  var itemScaffold = {
    description: '',
    log: []
  };

  // Group time pairs by description, creating "line items"
  state.data.forEach(function (entry) {
    var timePair = {
      start: new Date(entry.start),
      end: new Date(entry.end)
    };

    var existingItem = state.lineItems.find(function (line) {
      return line.description === entry.msg;
    });

    if (existingItem) {
      existingItem.log.push(timePair);
    } else {
      // Clone scaffold to create new item
      var newItem = (0, _clone2.default)(itemScaffold);
      newItem.description = entry.msg;
      newItem.log.push(timePair);

      // Add getters
      Object.defineProperty(newItem, 'entries', {
        get: function get() {
          return this.log.length;
        }
      });

      Object.defineProperty(newItem, 'hours', {
        get: function get() {
          var total = 0;
          this.log.forEach(function (item) {
            total = total + Math.abs(item.end - item.start) / 36e5;
          });
          return Math.round(total * 100) / 100;
        }
      });

      // Add to the item list
      state.lineItems.push(newItem);
    }
  });

  // Initialize output table
  var table = new _cliTable2.default({
    head: ['Item Description', 'Entries', 'Hours'],
    style: { head: ['cyan'] }
  });

  // Set variable for counting total hours
  var totalHours = 0;
  state.lineItems.forEach(function (item) {
    totalHours += item.hours;
    table.push([item.description, item.entries, item.hours.toFixed(2)]);
  });

  // Add final row for total
  table.push([{ content: _chalk2.default.green('TOTAL'), colSpan: 2 }, totalHours.toFixed(2)]);

  // Print table
  io.writeln(table.toString());
};

exports.default = parse;