const debug = require('debug')('test');
const _ = require('lodash');
const should = require('chai').should();
const sinon = require('sinon');
const path = require('path');
const Scanner = require('../src/Scanner');
const Calculator = require('../src/Calculator');

describe('full test', async () => {
  it('usage', async () => {
    let calculator = new Calculator();
    let scanner = new Scanner(path.join(__dirname, 'fixtures/testData.txt'));
    await scanner.load();
    for await (let each of scanner.entries) {
      calculator.calc(each);
    }
  });

  describe('calc test', () => {
    let calculator = new Calculator();

    it('success cases', () => {
      _.each([
        { distance: 1, time: 0, expected: 6 },
        { distance: 3, time: 0, expected: 7 },
        { distance: 10, time: 0, expected: 13 },
        { distance: 2, time: 3, expected: 7 }
      ], ({ distance, time, expected }) => {
        calculator.calc({ distance, time }).should.eq(expected);
      });
    });
  });
});