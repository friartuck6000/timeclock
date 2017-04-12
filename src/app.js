#!/usr/bin/env node
import app from 'commander'
import path from 'path'

// Package config
import pkg from '../package.json'

// Command actions
import startAction from './cmd/start'

// Set up basic app config
app.version(pkg.version)

// Register start command
app.command('start [msg]')
  .option('-d, --dir <path>', 'Working directory')
  .action(startAction)

app.parse(process.argv)
