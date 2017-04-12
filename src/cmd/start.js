import chalk from 'chalk'
import chokidar from 'chokidar'
import path from 'path'
import readline from 'readline'

import * as io from '../util/io'

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
  watcher: null,
  idleTimer: null
}

/**
 * Idle timeout, in MINUTES.
 */
const IDLE_TIMEOUT = 15

/**
 * Reset the idle timer.
 */
const _resetTimer = () => {
  clearTimeout(state.idleTimer)
  state.idleTimer = setTimeout(() => {
    io.clear()
    io.writeln(' -> ', chalk.yellow(`Idle for ${IDLE_TIMEOUT} minutes; stopping...`))
    _finish()
  }, IDLE_TIMEOUT * 600)
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

  console.log(state.data)
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
 * @param  {string}  opts.dir  A working directory to use (defults to the CWD).
 */
const start = (msg, opts) => {
  // Set working dir
  state.cwd = path.resolve(opts.dir || process.cwd())

  if (msg) {
    // Use given message if one exists
    state.data.msg = msg
    _run()
  } else {
    // Otherwise, prompt for one
    let reader = readline.createInterface({ input: process.stdin, output: process.stdout })
    reader.question(
      'Description ' + chalk.cyan(`[(default)]`) + ':\n',
      (answer) => {
        state.data.msg = answer
        _run()
        reader.close()
      }
    )
  }
}

export default start
