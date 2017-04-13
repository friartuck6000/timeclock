import fs from 'fs'

/**
 * Concatenate and write arbitrary strings to stdout.
 *
 * @param  {...string}  things
 */
export const write = (...things) => {
  things.forEach(thing => {
    process.stdout.write(thing);
  });
};

/**
 * Same thing as __write, but adds a newline afterward.
 *
 * @param  {...string}  things
 */
export const writeln = (...things) => {
  write(...things);
  process.stdout.write('\n');
};

/**
 * Clears the current line.
 */
export const clear = () => {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
};

/**
 * Load a file and parse it as JSON.
 *
 * @param  {string}  path
 * @return {*|boolean}
 */
export const readJson = (path) => {
  try {
    return JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }))
  } catch (e) {
    return false
  }
}

/**
 * Write an object to a file as JSON.
 *
 * @param   {string}  path
 * @param   {*}       data
 * @return  {boolean}
 */
export const writeJson = (path, data) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data), { encoding: 'utf8' })
    return true
  } catch (e) {
    return false
  }
}
