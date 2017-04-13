import chalk from 'chalk'
import Table from 'cli-table2'
import clone from 'clone'
import path from 'path'

import { FILENAME } from '../config'
import * as io from '../util/io'

/**
 * Command state.
 */
const state = {
  cwd: null,
  data: null,
  lineItems: []
}

/**
 * Parse the contents of a timesheet.
 *
 * @param  {object}  opts  Optional parameters passed in.
 *
 * @param  {string}  opts.dir  A working directory to use (defults to the CWD).
 */
const parse = (opts) => {
  // Set working dir
  state.cwd = path.resolve(opts.dir || process.cwd())

  // Load JSON
  let filePath = `${state.cwd}/${FILENAME}`
  state.data = io.readJson(filePath)
  if (!state.data) {
    io.writeln(' -> ', chalk.red('Error reading timesheet data!'))
    process.exit(1)
  }

  // Define scaffold for line items
  const itemScaffold = {
    description: '',
    log: []
  }

  // Group time pairs by description, creating "line items"
  state.data.forEach((entry) => {
    let timePair = {
      start: new Date(entry.start),
      end: new Date(entry.end)
    }

    let existingItem = state.lineItems.find((line) => {
      return line.description === entry.msg
    })

    if (existingItem) {
      existingItem.log.push(timePair)
    } else {
      // Clone scaffold to create new item
      let newItem = clone(itemScaffold)
      newItem.description = entry.msg
      newItem.log.push(timePair)

      // Add getters
      Object.defineProperty(newItem, 'entries', { get () {
        return this.log.length
      } })

      Object.defineProperty(newItem, 'hours', { get () {
        let total = 0
        this.log.forEach((item) => {
          total = total + (Math.abs(item.end - item.start) / 36e5)
        })
        return Math.round(total * 100) / 100
      } })

      // Add to the item list
      state.lineItems.push(newItem)
    }
  })

  // Initialize output table
  let table = new Table({
    head: ['Item Description', 'Entries', 'Hours'],
    style: { head: ['cyan'] }
  })

  // Set variable for counting total hours
  let totalHours = 0
  state.lineItems.forEach((item) => {
    totalHours += item.hours
    table.push([item.description, item.entries, item.hours.toFixed(2)])
  })

  // Add final row for total
  table.push([
    { content: chalk.green('TOTAL'), colSpan: 2 },
    totalHours.toFixed(2)
  ])

  // Print table
  io.writeln(table.toString())
}

export default parse
