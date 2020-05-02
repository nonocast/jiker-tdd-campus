const debug = require('debug')('app:calculator');
const _ = require('lodash');
const Calculator = require('./Calculator');

/**
 * @class Receipt 
 */
class Receipt {
  constructor(entries) {
    this.entries = entries;
  }

  toString() {
    let calculator = new Calculator();
    return _.map(this.entries,
      each => `收费${calculator.calc(each)}元\n`).join('');
  }
}

module.exports = Receipt;