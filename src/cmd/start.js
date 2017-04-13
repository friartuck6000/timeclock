import chalk from 'chalk'
import chokidar from 'chokidar'
import path from 'path'
import readline from 'readline'

import { FILENAME, IDLE_TIMEOUT } from '../config'
import * as io from '../util/io'
import { roundMinutes } from '../util/util'

/**
 * Command state.
 */
const state = {
  cwd: null,
  data: {
    msg: null,
    start: null,
    end: null
  },
  existing: null,
  watcher: null,
  allowTimer: true,
  idleTimer: null
}

/**
 * Attempt to read and parse a timesheet file. The file will be created
 * if it doesn't exist.
 */
const _readJson = () => {
  // Open or create the timesheet
  let filePath = `${state.cwd}/${FILENAME}`
  state.existing = io.readJson(filePath) || []
}

/**
 * Write the data set to the timesheet.
 */
const _writeJson = () => {
  let filePath = `${state.cwd}/${FILENAME}`
  if (!io.writeJson(filePath, state.existing)) {
    io.clear()
    io.writeln(chalk.red(' -> Save failed: ' + e))
  }
}

/**
 * Retrieve the last entry in the timesheet, if there is one.
 *
 * @return  {object|boolean}  The entry if there is one, or false otherwise.
 */
const _getLastEntry = () => {
  if (state.existing && state.existing.length) {
    return state.existing[state.existing.length - 1]
  }

  return false
}

/**
 * Reset the idle timer.
 */
const _resetTimer = () => {
  if (state.allowTimer) {
    clearTimeout(state.idleTimer)
    state.idleTimer = setTimeout(() => {
      io.clear()
      io.writeln(' -> ', chalk.yellow(`Idle for ${IDLE_TIMEOUT} minutes; stopping...`))
      _finish()
    }, IDLE_TIMEOUT * 60000)
  }
}

/**
 * Log a filesystem event.
 *
 * @param  {string}  event  The event that occurred.
 * @param  {string}  path   The full path to the modified file.
 */
const _logEvent = (event, path) => {
  let relPath = path.replace(state.cwd + '/', '')
  io.clear()
  io.writeln(' -> Latest change: ', chalk.green(`(${event}) `), chalk.magenta(relPath))
  io.write(' -> ')
  _resetTimer()
}

/**
 * Write the log entry and finish execution.
 */
const _finish = () => {
  // Set end time
  state.data.end = new Date()

  // Round datestamps
  roundMinutes(state.data.start, 15, 10)
  roundMinutes(state.data.end, 15, 5)

  // Write file
  state.existing.push(state.data)
  _writeJson()

  // Exit
  state.watcher.close()
  process.exit()
}

/**
 * Wait for manual stop or inactivity.
 */
const _run = () => {
  // Set start time
  state.data.start = new Date()

  io.writeln(' -> ', chalk.green('You\'re on the clock...'))
  io.write(' -> ')

  // Begin watching
  _resetTimer()
  state.watcher = chokidar.watch(`${state.cwd}/**/*`, { ignoreInitial: true })
    .on('all', _logEvent)

  // Handle manual exit
  process.on('SIGINT', () => {
    io.clear()
    io.writeln(' -> ', chalk.yellow('Stopping timeclock manually.'))
    _finish()
  })
}

/**
 * Start a new time recording session.
 *
 * @param  {string}  msg   The log message to use. If none is given, the user will be
 *                         prompted to enter one.
 * @param  {object}  opts  Optional parameters passed in.
 *
 * @param  {string}  opts.dir         A working directory to use (defults to the CWD).
 * @param  {string}  opts.manualOnly  If set, automatic exit will be disabled.
 */
const start = (msg, opts) => {
  // Set working dir
  state.cwd = path.resolve(opts.dir || process.cwd())

  // Disable timer if specified
  if (opts.manualOnly) {
    state.allowTimer = false
  }

  // Try to load existing timesheet data
  _readJson()

  if (msg) {
    // Use given message if one exists
    state.data.msg = msg
    _run()
  } else {
    // Otherwise, prompt for one
    // Set default message - repeat last entry's message if it exists
    let defaultMsg = ''
    let lastEntry = _getLastEntry()
    if (lastEntry && lastEntry.msg) {
      defaultMsg = lastEntry.msg
    }

    let reader = readline.createInterface({ input: process.stdin, output: process.stdout })
    reader.question(
      'Description ' + chalk.cyan(`[${defaultMsg}]`) + ':\n',
      (answer) => {
        state.data.msg = answer
        _run()
        reader.close()
      }
    )
  }
}

export default start
