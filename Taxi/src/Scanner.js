const debug = require('debug')('app:scanner');
const _ = require('lodash');
const fs = require('fs').promises;
const os = require('os');

/**
 * @class Scanner
 */
class Scanner {
  get entries() {
    return this._entries;
  }

  constructor(path) {
    this.path = path;
  }

  async load() {
    let data = await fs.readFile(this.path, 'utf-8');
    let lines = data.split(os.EOL);

    this._entries = _(lines).each(x => {
      if (!x.match(/\d+公里,等待\d+分钟/)) {
        throw new Error('not match');
      }
    }).map(x => {
      let [distance, time] = x.match(/(\d+)公里,等待(\d+)分钟/).slice(1, 3);
      return { distance, time }
    }).values();
  }
};

module.exports = Scanner;