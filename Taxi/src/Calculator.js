const debug = require('debug')('app:calculator');
const _ = require('lodash');

/**
 * @class Calculator
 */
class Calculator {
  constructor() {
    this.rules = [
      () => 6,
      ({ distance }) => distance > 2 ? (distance - 2) * 0.8 : 0,
      ({ distance }) => distance > 8 ? (distance - 8) * 0.4 : 0,
      ({ time }) => time * 0.25
    ];
  }

  calc({ distance, time }) {
    return _.reduce(this.rules, (sum, each) => sum + each({ distance, time }), 0).round();
  }
}

Number.prototype.round = function () { return Math.round(this); }

module.exports = Calculator;