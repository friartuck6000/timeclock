#!/usr/bin/env node
'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _start = require('./cmd/start');

var _start2 = _interopRequireDefault(_start);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Set up basic app config


// Package config
_commander2.default.version(_package2.default.version);

// Register start command


// Command actions
_commander2.default.command('start [msg]').option('-m, --manual-only', 'Disable the idle timeout').option('-d, --dir <path>', 'Working directory').action(_start2.default);

_commander2.default.parse(process.argv);