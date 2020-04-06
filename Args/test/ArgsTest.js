const debug = require('debug')('test');
const _ = require('lodash');
const should = require('chai').should();
const Args = require('../src/Args');

describe('ArgsTest', () => {
  it('usage', () => {
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
  });

  it('success cases', () => {
    _.each([
      { schema: '', command: '', expect: {} },
      { schema: '_:string', command: '-_ hello', expect: { _: 'hello' } },
      { schema: 'l:boolean', command: '-l', expect: { l: true } },
      { schema: 'l:boolean', command: '', expect: { l: false } },
      { schema: 'p:integer', command: '-p 80', expect: { p: 80 } },
      { schema: 'p:integer', command: '-p 0', expect: { p: 0 } },
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
    let args = new Args();

    it('invalid flag name', () => {
      (() => args.schema(':boolean')).should.throw('schema format error');
      (() => args.schema('@:boolean')).should.throw('schema format error');
      (() => args.schema('.:boolean')).should.throw('schema format error');
      (() => args.schema('***___xxx:boolean')).should.throw('schema format error');
    });

    it('invalid type name', () => {
      (() => args.schema('x:whatever')).should.throw('schema format error');
      (() => args.schema('x:')).should.throw('schema format error');
      (() => args.schema('foo:bar')).should.throw('schema format error');
      (() => args.schema('x:string y:int')).should.throw('schema format error');
      (() => args.schema('x:String')).should.throw('schema format error');
      (() => args.schema('x:STRING')).should.throw('schema format error');
    });
  });

  describe('exception cases: command', () => {

    describe('case 1', () => {
      let args = new Args()
        .schema('l:boolean p:integer d:string o:string k:boolean u:integer s:array')

      it('invalid command format', () => {
        (() => args.parse('a')).should.throw("invalid command, flag should start with '-'");
        (() => args.parse('hello')).should.throw("invalid command, flag should start with '-'");
        (() => args.parse('l true p')).should.throw("invalid command, flag should start with '-'");
      });

      it('flag not defined in schema', () => {
        (() => args.parse('-A')).should.throw("invalid command, flag not found");
        (() => args.parse('-foo bar')).should.throw("invalid command, flag not found");
      });

      it('invalid boolean args', () => {
        // boolean rule do not take any followed slice, so we will determine 'true' is an invalid flag
        (() => args.parse('-l true')).should.throw("invalid command, flag should start with '-'");
      });

      it('invalid integer args', () => {
        (() => args.parse('-p')).should.throw('wrong integer format');
        (() => args.parse('-p -k')).should.throw('wrong integer format');
        (() => args.parse('-p x -k')).should.throw('wrong integer format');
        (() => args.parse('-p NaN -k')).should.throw('wrong integer format');
      });

      it('invalid string args', () => {
        (() => args.parse('-d')).should.throw('wrong string format');
        // '-u' is mistaken for '-d''s argument, so we will determine '0' is an invalid flag
        (() => args.parse('-d -u 0')).should.throw("invalid command, flag should start with '-'");
        (() => args.parse('-d "xxxxx')).should.throw('missing closed tag');
        (() => args.parse("-d 'xxxxx")).should.throw('missing closed tag');
      });

      it('invalid array args', () => {
        (() => args.parse('-s')).should.throw('wrong array format');
      });
    });
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