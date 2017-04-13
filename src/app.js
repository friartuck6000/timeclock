#!/usr/bin/env node
import app from 'commander'
import path from 'path'

// Package config
import pkg from '../package.json'

// Command actions
import startAction from './cmd/start'
import parseAction from './cmd/parse'

// Set up basic app config
app.version(pkg.version)

// Register start command
app.command('start [msg]')
  .option('-m, --manual-only', 'Disable the idle timeout')
  .option('-d, --dir <path>', 'Working directory')
  .action(startAction)

// Register parse command
app.command('parse')
  .option('-d, --dir <path>', 'Working directory')
  .action(parseAction)
app.parse(process.argv)
