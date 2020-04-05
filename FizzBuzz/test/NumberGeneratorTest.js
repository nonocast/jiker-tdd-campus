const _ = require('lodash');
const should = require('chai').should();
const NumberGenerator = require('../src/NumberGenerator');

describe('NumberGeneratorTest', () => {
  let generator = new NumberGenerator();
  let [Fizz, Buzz, FizzBuzz] = ['Fizz', 'Buzz', 'FizzBuzz'];

  it('success cases', () => {
    _.each([
      [1, 1],
      [2, 2],
      [3, Fizz],
      [4, 4],
      [5, Buzz],
      [6, Fizz],
      [7, 7],
      [8, 8],
      [9, Fizz],
      [10, Buzz],
      [11, 11],
      [12, Fizz],
      [13, 13],
      [14, 14],
      [15, FizzBuzz]
    ], ([arg, expect]) => {
      generator.generate(arg).should.eq(expect);
    });
  });

  it('exception cases: wrong arugment scope', () => {
    (() => generator.generate(0)).should.throw();
    (() => generator.generate(101)).should.throw();
    (() => generator.generate(-1)).should.throw();
    (() => generator.generate(-100)).should.throw();
  });

  it('exception cases: wrong argument(s)', () => {
    (() => generator.generate()).should.throw();
    (() => generator.generate(null)).should.throw();
    (() => generator.generate('foobar')).should.throw();
    (() => generator.generate(true)).should.throw();
    (() => generator.generate(false)).should.throw();
    (() => generator.generate(NaN)).should.throw();
    (() => generator.generate(1.23)).should.throw();
    (() => generator.generate([])).should.throw();

    (() => generator.generate(1, 1, 1)).should.throw();
    (() => generator.generate(null, 2, 3)).should.throw();
  });
});