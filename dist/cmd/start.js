'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _readline = require('readline');

var _readline2 = _interopRequireDefault(_readline);

var _io = require('../util/io');

var io = _interopRequireWildcard(_io);

var _util = require('../util/util');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Command state.
 */
var state = {
  cwd: null,
  data: {
    msg: null,
    start: null,
    end: null
  },
  existing: null,
  watcher: null,
  idleTimer: null
};

/**
 * Timesheet log filename.
 */
var FILENAME = '.timesheet.json';

/**
 * Idle timeout, in MINUTES.
 */
var IDLE_TIMEOUT = 15;

/**
 * Attempt to read and parse a timesheet file. The file will be created
 * if it doesn't exist.
 */
var _loadJson = function _loadJson() {
  // Open or create the timesheet
  var filePath = state.cwd + '/' + FILENAME;
  try {
    state.existing = JSON.parse(_fs2.default.readFileSync(filePath, { encoding: 'utf8' }));
  } catch (e) {
    state.existing = [];
  }
};

/**
 * Write the data set to the timesheet.
 */
var _writeJson = function _writeJson() {
  var filePath = state.cwd + '/' + FILENAME;
  try {
    _fs2.default.writeFileSync(filePath, JSON.stringify(state.existing), { encoding: 'utf8' });
  } catch (e) {
    io.clear();
    io.writeln(_chalk2.default.red(' -> Save failed: ' + e));
  }
};

/**
 * Retrieve the last entry in the timesheet, if there is one.
 *
 * @return  {object|boolean}  The entry if there is one, or false otherwise.
 */
var _getLastEntry = function _getLastEntry() {
  if (state.existing && state.existing.length) {
    return state.existing[state.existing.length - 1];
  }

  return false;
};

/**
 * Reset the idle timer.
 */
var _resetTimer = function _resetTimer() {
  clearTimeout(state.idleTimer);
  state.idleTimer = setTimeout(function () {
    io.clear();
    io.writeln(' -> ', _chalk2.default.yellow('Idle for ' + IDLE_TIMEOUT + ' minutes; stopping...'));
    _finish();
  }, IDLE_TIMEOUT * 6000);
};

/**
 * Log a filesystem event.
 *
 * @param  {string}  event  The event that occurred.
 * @param  {string}  path   The full path to the modified file.
 */
var _logEvent = function _logEvent(event, path) {
  var relPath = path.replace(state.cwd + '/', '');
  io.clear();
  io.writeln(' -> Latest change: ', _chalk2.default.green('(' + event + ') '), _chalk2.default.magenta(relPath));
  io.write(' -> ');
  _resetTimer();
};

/**
 * Write the log entry and finish execution.
 */
var _finish = function _finish() {
  // Set end time
  state.data.end = new Date();

  // Round datestamps
  (0, _util.roundMinutes)(state.data.start, 15, 10);
  (0, _util.roundMinutes)(state.data.end, 15, 5);

  // Write file
  state.existing.push(state.data);
  _writeJson();

  // Exit
  state.watcher.close();
  process.exit();
};

/**
 * Wait for manual stop or inactivity.
 */
var _run = function _run() {
  // Set start time
  state.data.start = new Date();

  io.writeln(' -> ', _chalk2.default.green('You\'re on the clock...'));
  io.write(' -> ');

  // Begin watching
  _resetTimer();
  state.watcher = _chokidar2.default.watch(state.cwd + '/**/*', { ignoreInitial: true }).on('all', _logEvent);

  // Handle manual exit
  process.on('SIGINT', function () {
    io.clear();
    io.writeln(' -> ', _chalk2.default.yellow('Stopping timeclock manually.'));
    _finish();
  });
};

/**
 * Start a new time recording session.
 *
 * @param  {string}  msg   The log message to use. If none is given, the user will be
 *                         prompted to enter one.
 * @param  {object}  opts  Optional parameters passed in.
 *
 * @param  {string}  opts.dir  A working directory to use (defults to the CWD).
 */
var start = function start(msg, opts) {
  // Set working dir
  state.cwd = _path2.default.resolve(opts.dir || process.cwd());

  // Try to load existing timesheet data
  _loadJson();

  if (msg) {
    // Use given message if one exists
    state.data.msg = msg;
    _run();
  } else {
    // Otherwise, prompt for one
    // Set default message - repeat last entry's message if it exists
    var defaultMsg = '';
    var lastEntry = _getLastEntry();
    if (lastEntry && lastEntry.msg) {
      defaultMsg = lastEntry.msg;
    }

    var reader = _readline2.default.createInterface({ input: process.stdin, output: process.stdout });
    reader.question('Description ' + _chalk2.default.cyan('[' + defaultMsg + ']') + ':\n', function (answer) {
      state.data.msg = answer;
      _run();
      reader.close();
    });
  }
};

exports.default = start;