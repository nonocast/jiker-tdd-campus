const debug = require('debug')('test');
const _ = require('lodash');
const should = require('chai').should();
const Args = require('../src/Args');

describe('args test', () => {
  describe('overview', () => {
    it('success case', () => {
      let args = new Args()
        .schema('l:boolean p:integer d:string k:boolean')
        .parse('-l -p 8080 -d /usr/logs');
      args.get('l').should.eq(true);
      args.get('k').should.eq(false);
      args.get('p').should.eq(8080);
      args.get('d').should.eq('/usr/logs');
    });
  });

  describe('schema test', () => {
    it('scucess case', () => {
      let args = new Args().schema('l:boolean p:integer d:string k:boolean')
      args._schema.should.be.a('object');
      Object.keys(args._schema).should.eql(['l', 'p', 'd', 'k']);
      args._schema['l'].type.should.eq('boolean');
      args._schema['k'].type.should.eq('boolean');
      args._schema['p'].type.should.eq('integer');
      args._schema['d'].type.should.eq('string');
    });
  });

  describe('command test', () => {
    it('scucess case', () => {
      let args = new Args()
        .schema('l:boolean p:integer d:string k:boolean')
        .parse('-l -p 8080 -d /usr/logs');

      args._flags.should.be.a('object');
      Object.keys(args._flags).should.eql(['l', 'p', 'd']);
      args._flags['l'].should.eq(true);
      args._flags['p'].should.eq(8080);
      args._flags['d'].should.eq('/usr/logs');
      should.not.exist(args._flags['k']);
    });
  });
});