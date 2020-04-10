const debug = require('debug')('test');
const _ = require('lodash');
const should = require('chai').should();
const sinon = require("sinon");
const MarsRover = require('../src/MarsRover');

describe('Mars Rover Test', () => {
  describe('overview', () => {
    it.only('mars rover', () => {
      let rover = new MarsRover();
      rover.execute('10 10\n0 0 N\nfrff').should.eq('2 1 E');
      rover.world.should.eql({ w: 10, h: 10 });
      rover.location.should.eql({ x: 2, y: 1 });

      rover.execute('bblb').should.eq('0 0 N');
    });
  });

  describe('command test', () => {
    it('success case', () => {
      let rover = new MarsRover();

      // fake state
      _.each(['world', 'land', 'forward', 'back', 'left', 'right'],
        each => rover._state[each] = sinon.fake());

      let commands = rover._parse('10 10\n0 0 N\nfrbll\nrrrr');
      commands.length.should.eq(11);

      _.each(commands, command => command());

      rover._state.world.called.should.eq(true);
      rover._state.world.firstCall.args.should.eql([10, 10]);

      rover._state.land.called.should.eq(true);
      rover._state.land.firstCall.args.should.eql([0, 0, 'N']);

      rover._state.forward.callCount.should.eq(1);
      rover._state.back.callCount.should.eq(1);
      rover._state.left.callCount.should.eq(2);
      rover._state.right.callCount.should.eq(5);
    });
  });


  describe('state test', () => {
    it('success case', () => {
      let rover = new MarsRover();
      (() => { rover._state.land(10, 10, 'K') }).should.throw('invalid transfer');
      rover._state.world(10, 10);
      rover._state.land(10, 10, 'N');
      (() => { rover._state.world(20, 20) }).should.throw('invalid transfer');
    });
  });
});