const debug = require('debug')('test');
const _ = require('lodash');
const should = require('chai').should();
const sinon = require("sinon");
const MarsRover = require('../src/MarsRover');


describe('Mars Rover Test', () => {
  it('usage', () => {
    let rover = new MarsRover();
    rover.execute('10 10\n0 0 N\nfrff').should.eq('2 1 E');
    rover.execute('bblb').should.eq('0 0 N');
  });

  it('success cases: normal commands', () => {
    _.each([
      { batch: ['0 0\n0 0 N'], expect: '0 0 N' },
      { batch: ['10 10\n0 0 N'], expect: '0 0 N' },
      { batch: ['10 10\n1 1 N'], expect: '1 1 N' },
      { batch: ['10 10\n10 10 S'], expect: '10 10 S' },
      { batch: ['10 10\n0 0 N\nfffff'], expect: '0 5 N' },
      { batch: ['10 10\n0 0 E\nfffff'], expect: '5 0 E' },
      { batch: ['10 10\n0 5 S\nfff'], expect: '0 2 S' },
      { batch: ['10 10\n5 5 W\nfff'], expect: '2 5 W' },
      { batch: ['10 10\n0 0 N\nllll'], expect: '0 0 N' },
      { batch: ['10 10\n0 0 N\nrrrr'], expect: '0 0 N' },
      { batch: ['10 10\n0 0 N', 'fff', 'bbb'], expect: '0 0 N' },
    ], ({ batch, expect }) => {
      let result = null;
      let rover = new MarsRover();
      _.each(batch, each => result = rover.execute(each));
      result.should.eq(expect);
    });
  });

  it('success cases: test world bounds', () => {
    _.each([
      { batch: ['0 0\n0 0 N\nf'], expect: '0 0 N' },
      { batch: ['0 0\n0 0 N\nb'], expect: '0 0 N' },
      { batch: ['0 0\n0 0 E\nf'], expect: '0 0 E' },
      { batch: ['0 0\n0 0 E\nb'], expect: '0 0 E' },
      { batch: ['0 0\n0 0 S\nf'], expect: '0 0 S' },
      { batch: ['0 0\n0 0 S\nb'], expect: '0 0 S' },
      { batch: ['0 0\n0 0 W\nf'], expect: '0 0 W' },
      { batch: ['0 0\n0 0 W\nb'], expect: '0 0 W' },
    ], ({ batch, expect }) => {
      let result = null;
      let rover = new MarsRover();
      _.each(batch, each => result = rover.execute(each));
      result.should.eq(expect);
    });
  });

  it('test state machine', () => {
    (() => new MarsRover().execute('0 0')).should.throw();
    new MarsRover().execute('0 0\n0 0 N');
    new MarsRover().execute('0 0\n0 0 N\nf');
    (() => new MarsRover().execute('0 0 N\nf')).should.throw();
    (() => new MarsRover().execute('f')).should.throw();
    (() => new MarsRover().execute('l')).should.throw();
    (() => new MarsRover().execute('0 0\n0 0 N\nf\n0 0')).should.throw();
    (() => new MarsRover().execute('0 0\n0 0 N\nf\n0 0 N')).should.throw();
  });

  it('exception cases', () => {
    (() => new MarsRover().execute()).should.throw(TypeError);
    (() => new MarsRover().execute(123)).should.throw(TypeError);
    (() => new MarsRover().execute(true)).should.throw(TypeError);
    (() => new MarsRover().execute('')).should.throw(TypeError);
    (() => new MarsRover().execute('-')).should.throw('invalid command format');
    (() => new MarsRover().execute('A A\nA A S')).should.throw('invalid command format');
    (() => new MarsRover().execute('0 0')).should.throw('invalid operation');
    (() => new MarsRover().execute('1 1')).should.throw('invalid operation');
    (() => new MarsRover().execute('-1 -1\n0 0 N')).should.throw('invalid command format');
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
      (() => { rover._state.land(10, 10, 'K') }).should.throw('invalid operation');
      rover._state.world(10, 10);
      rover._state.land(10, 10, 'N');
      (() => { rover._state.world(20, 20) }).should.throw('invalid operation');
    });
  });
});