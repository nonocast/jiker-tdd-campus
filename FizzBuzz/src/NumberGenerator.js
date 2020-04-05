const _ = require('lodash');

class NumberGenerator {
  constructor() {
    [this.Fizz, this.Buzz, this.FizzBuzz] = ['Fizz', 'Buzz', 'FizzBuzz'];
    this.rules = [
      {
        match: n => (n % 3 === 0) && (n % 5 === 0),
        generate: () => this.FizzBuzz
      },
      {
        match: n => n % 5 === 0,
        generate: () => this.Buzz
      },
      {
        match: n => n % 3 === 0,
        generate: () => this.Fizz
      },
      {
        match: () => true,
        generate: n => n
      }
    ];
  }

  /**
   * FizzBuzz: 
   * 打印出从1到100的数字，将其中3的倍数替换成“Fizz”，5的倍数替换成“Buzz”。
   * 既能被3整除、又能被5整除的数则替换成“FizzBuzz"
   * 
   * @param {number} n
   * @return {number}
   */
  generate(n) {
    if (arguments.length !== 1) throw new Error('wrong argument amount');
    if (typeof n !== 'number' || isNaN(n) || n % 1 !== 0) throw new Error('wrong argument type');
    if (n < 1 || n > 100) throw new Error('argument: out of range (acceptable range: [1, 100])');

    return _.find(this.rules, rule => rule.match(n)).generate(n);
  }
}

module.exports = NumberGenerator;