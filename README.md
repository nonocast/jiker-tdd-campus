# 单元测试

- [mocha](https://mochajs.org)
- [chai](https://www.chaijs.com)
- [nyc](https://github.com/istanbuljs/nyc)
- [sinon](http://sinonjs.org)

## mocha

意图: 提供测试框架

```js
describe('Mars Rover Test', () => {
  it('usage', () => {
    let rover = new MarsRover();
    rover.execute('10 10\n0 0 N\nfrff').should.eq('2 1 E');
    rover.execute('bblb').should.eq('0 0 N');
  });
});
```

package.json

```json
"test": "mocha"
```

对应的配置文件 .mocharc.js

```js
require('dotenv').config({ path: '.env.test' });

module.exports = {
  file: ['./test/ArgsTest.js'],
  recursive: false,
  watch: false,
};
```

mocha 的配置文件支持:

- .mocharc.js
- .mocharc.yaml
- .mocharc.yml
- .mocharc.jsonc
- .mocharc.json

讲道理, yaml 肯定是最方便的, 但是用 js 有一个最大的好处就是可以在这里做一些全局初始化的事情, 算是一个 tricky.

更多配置项见[这里](https://github.com/mochajs/mocha/blob/master/example/config/.mocharc.yml)。

## chai

意图: 提供断言库

三个方式:

- assert
- expect
- should

个人推荐 should

```js
let args = new Args()
  .schema('l:boolean p:integer d:string o:string k:boolean u:integer s:array')
  .parse('-l -p 8080 -d /usr/logs -o "hello world -whatever" -u -100 -s this,is,a,2,-3,5,list');
args.get('l').should.eq(true);
args.get('p').should.eq(8080);
args.get('d').should.eq('/usr/logs');
args.get('k').should.eq(false);
args.get('o').should.eq('hello world -whatever');
args.get('u').should.eq(-100);
args.get('s').should.eql(['this', 'is', 'a', '2', '-3', '5', 'list']);

(() => args.schema('.:boolean')).should.throw('schema format error');
(() => args.schema('***___xxx:boolean')).should.throw('schema format error');
```

## nyc

意图: 生成代码覆盖率

package.json

```json
"scripts": {
  "test": "mocha",
  "coverage": "nyc --reporter=html --reporter=text-summary mocha",
  "cloc:src": "cloc src/**.js",
  "cloc:test": "cloc test/**.js"
},
```

## sinon

意图: 提供[Test dobule](https://en.wikipedia.org/wiki/Test_double)隔离不相关的实现, 即"替身"

Martin Fowler 在[Test double](https://martinfowler.com/bliki/TestDouble.html)一文中提出 5 种常规的方法:

- **Dummy** objects are passed around but never actually used. Usually they are just used to fill parameter lists.
- **Fake** objects actually have working implementations, but usually take some shortcut which makes them not suitable for production (an InMemoryTestDatabase is a good example).
- **Stubs** provide canned answers to calls made during the test, usually not responding at all to anything outside what's programmed in for the test.
- **Spies** are stubs that also record some information based on how they were called. One form of this might be an email service that records how many messages it was sent.
- **Mocks** are pre-programmed with expectations which form a specification of the calls they are expected to receive. They can throw an exception if they receive a call they don't expect and are checked during verification to ensure they got all the calls they were expecting.

以最常用的 fake 举例:

```js
let state = {
  land: sinon.fake(),
  forward: sinon.fake()
}

// 替换原有对象
rover.state = state;

// 执行被测试代码
rover.action(...);

// 检查是否正确调用state的land方法
rover.state.land.called.should.eq(true);
rover.state.land.firstCall.args.should.eql([10, 10]);
```

- fake
- spy
- stub
- mock

# cloc

意图: 提供代码行数统计

```js
"cloc:src": "cloc src/**.js"
```

# Put them together

```sh
➜  args git:(master) ✗ yarn test
yarn run v1.21.1
$ mocha


  ArgsTest
    ✓ usage
    ✓ success cases
    exception cases: schema
      ✓ invalid flag name
      ✓ invalid type name
    exception cases: command
      ✓ invalid command format
      ✓ flag not defined in schema
      ✓ invalid boolean args
      ✓ invalid integer args
      ✓ invalid string args
      ✓ invalid array args
    test command parse to slice
      ✓ success cases
      ✓ exception cases


  12 passing (19ms)

✨  Done in 0.44s.
➜  args git:(master) ✗ yarn coverage
yarn run v1.21.1
$ nyc --reporter=html --reporter=text-summary mocha


  ArgsTest
    ✓ usage
    ✓ success cases
    exception cases: schema
      ✓ invalid flag name
      ✓ invalid type name
    exception cases: command
      ✓ invalid command format
      ✓ flag not defined in schema
      ✓ invalid boolean args
      ✓ invalid integer args
      ✓ invalid string args
      ✓ invalid array args
    test command parse to slice
      ✓ success cases
      ✓ exception cases


  12 passing (23ms)


=============================== Coverage summary ===============================
Statements   : 96.3% ( 78/81 )
Branches     : 95.92% ( 47/49 )
Functions    : 95.24% ( 20/21 )
Lines        : 98.63% ( 72/73 )
================================================================================
✨  Done in 1.10s.
➜  args git:(master) ✗ yarn cloc:src
yarn run v1.21.1
$ cloc src/**.js
       1 text file.
       1 unique file.
       0 files ignored.

github.com/AlDanial/cloc v 1.80  T=0.01 s (88.9 files/s, 24613.3 lines/s)
-------------------------------------------------------------------------------
Language                     files          blank        comment           code
-------------------------------------------------------------------------------
JavaScript                       1             23            115            139
-------------------------------------------------------------------------------
✨  Done in 0.42s.
➜  args git:(master) ✗ yarn cloc:test
yarn run v1.21.1
$ cloc test/**.js
       1 text file.
       1 unique file.
       0 files ignored.

github.com/AlDanial/cloc v 1.80  T=0.01 s (134.6 files/s, 17897.9 lines/s)
-------------------------------------------------------------------------------
Language                     files          blank        comment           code
-------------------------------------------------------------------------------
JavaScript                       1             16              2            115
-------------------------------------------------------------------------------
✨  Done in 0.28s.
➜  args git:(master) ✗
```
