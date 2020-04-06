const debug = require('debug')('test');
const _ = require('lodash');
const should = require('chai').should();
const Args = require('../src/Args');

describe('ArgsTest', () => {
  it('usage', () => {
    let args = new Args()
      .schema('l:boolean p:integer d:string o:string k:boolean u:integer')
      .parse('-l -p 8080 -d /usr/logs -o "hello world -whatever" -u -100');
    args.get('l').should.eq(true);
    args.get('p').should.eq(8080);
    args.get('d').should.eq('/usr/logs');
    args.get('k').should.eq(false);
    args.get('o').should.eq('hello world -whatever');
    args.get('u').should.eq(-100);
  });

  it('success cases', () => {
    _.each([
      { schema: '', command: '', expect: {} },
      { schema: 'l:boolean', command: '-l', expect: { l: true } },
      { schema: 'l:boolean', command: '', expect: { l: false } },
      { schema: 'p:integer', command: '-p 80', expect: { p: 80 } },
      { schema: 'p:integer', command: '-p 80 -p 8080', expect: { p: 8080 } },
      { schema: 'p:integer', command: '-p -80', expect: { p: -80 } },
      { schema: 'd:string', command: '', expect: { d: '' } },
      { schema: 'd:string', command: '-d /usr/logs', expect: { d: '/usr/logs' } },
      { schema: 'd:string', command: '-d nonocast', expect: { d: 'nonocast' } },
      { schema: 'l:boolean p:integer', command: '', expect: { l: false, p: 0 } },
      { schema: 'l:boolean p:integer', command: '-l', expect: { l: true, p: 0 } },
      { schema: 'l:boolean p:integer', command: '-l -p 1', expect: { l: true, p: 1 } },
      { schema: 'l:boolean p:integer', command: '-p 1', expect: { l: false, p: 1 } },
      { schema: 'l:boolean p:integer u:string', command: '', expect: { l: false, p: 0 } },
    ], ({ schema, command, expect }) => {
      let args = new Args().schema(schema).parse(command);
      _.each(expect, (value, flag) => args.get(flag).should.be.eq(value));
    });
  });

  describe('exception cases: schema', () => {

  });

  describe('exception cases: command', () => {

  });

  describe('test command parse to slice', () => {
    let args = new Args();

    it('success cases', () => {
      _.each([
        { command: '', slices: [] },
        { command: '    ', slices: [] },
        { command: '  ', slices: [] },
        { command: 'foo bar', slices: ['foo', 'bar'] },
        { command: '  -l  with tab', slices: ['-l', 'with', 'tab'] },
        { command: '-l', slices: ['-l'] },
        { command: '-l -k -x', slices: ['-l', '-k', '-x'] },
        { command: '-l 8080', slices: ['-l', '8080'] },
        { command: '-l -8080', slices: ['-l', '-8080'] },
        { command: '-l 8080 -s "hello world"', slices: ['-l', '8080', '-s', 'hello world'] },
        { command: "-l -p 8080 -d /usr/logs/ -t 'hello world -x' -k -80", slices: ['-l', '-p', '8080', '-d', '/usr/logs/', '-t', 'hello world -x', '-k', '-80'] }
      ], ({ command, slices }) => {
        args._slices(command).should.eql(slices);
      });
    });

    it('exception cases', () => {
      (() => args._slices('"')).should.throw();
      (() => args._slices('-foo -bar "DO NOT CLOSED')).should.throw();
    });
  });
});