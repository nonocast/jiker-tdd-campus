const debug = require('debug')('app:Args');
const _ = require('lodash');

/**
 * @class MarsRover
 */
class MarsRover {
  get location() { return this._location; }
  get world() { return this._world; }
  get value() { return `${this.location.x} ${this.location.y} ${this.direction}`; }
  get direction() { return this._state.direction(); }

  /**
   * execute command
   * 
   * line1\nline2\n...lineN
   * 
   * line formats:
   * 1. 100 100 => set world size
   * 2. 0 0 N => set initial location and direction
   * 3. [fblr]+ => move/turn action
   * 
   * follow command to change rover's location
   * 
   * @param {String} command
   * @return {String} location & direction string (eg: 0 0 N)
   * @api @public
   */
  execute(command) {
    if (arguments.length !== 1) throw new TypeError();
    if (typeof command !== 'string' || command.trim() === '') throw new TypeError();

    let commands = this._parse(command);
    _.each(commands, c => c());
    return this.value;
  }

  /**
   * generate command object from command lines
   * 
   * Exception:
   * - throw 'invalid command format'
   * 
   * @param {String} command
   * @return {Array} commands
   * @api @private
   */
  _parse(command) {
    return _
      .chain(command)
      .split(/\n/)
      .map(_.trim)
      .compact()
      .reduce((commands, line) => {
        return _.concat(
          commands,
          _.find(this.rules, rule => rule.match(line)).parse(line)
        );
      }, [])
      .value();
  }

  _buildCommandLineRules() {
    return [
      {
        match: line => line.match(/^\d+\s\d+$/),
        parse: line => {
          let [x, y] = _.map(line.match(/^(\d+)\s(\d+)$/).slice(1, 3), each => parseInt(each));
          return () => this._state.world(x, y);
        }
      },
      {
        match: line => line.match(/^\d+\s\d+\s[NESW]$/),
        parse: line => {
          let [x, y, direction] = line.match(/^(\d+)\s(\d+)\s([NESW])$/).slice(1, 4);
          return () => this._state.land(parseInt(x), parseInt(y), direction);
        }
      },
      {
        match: line => line.match(/[fblr]+/),
        parse: line => {
          let actions = {
            f: () => this._state.forward(),
            b: () => this._state.back(),
            l: () => this._state.left(),
            r: () => this._state.right()
          };

          return _.chain(line).map(char => actions[char]).value();
        }
      },
      {
        match: line => { throw new Error(`invalid command format: ${line}`) }
      }
    ];
  }

  _buildStates() {
    return {
      unknown: _.create(MarsRoverState.prototype, {
        world: (w, h) => {
          try {
            this._world = { w, h };
            this._state = this.states.landing;
          } catch (error) {
            throw new Error('invalid world arguments');
          }
        }
      }),
      landing: _.create(MarsRoverState.prototype, {
        land: (x, y, direction) => {
          this._location = { x, y };
          this._state = this.states[`landed${direction}`];
          if (!this._state) throw new Error('invalid land arguments');
        }
      }),
      landedN: _.create(MarsRoverState.prototype, {
        direction: () => 'N',
        canForward: () => this.location.y < this._world.h,
        canBack: () => this.location.y > 0,
        forward: () => { if (this._state.canForward()) ++this.location.y },
        back: () => { if (this._state.canBack()) --this.location.y },
        left: () => this._state = this.states.landedW,
        right: () => this._state = this.states.landedE
      }),
      landedE: _.create(MarsRoverState.prototype, {
        direction: () => 'E',
        canForward: () => this.location.x < this._world.w,
        canBack: () => this.location.x > 0,
        forward: () => this._state.canForward() ? ++this.location.x : this.location.x,
        back: () => this._state.canBack() ? --this.location.x : this.location.x,
        left: () => this._state = this.states.landedN,
        right: () => this._state = this.states.landedS
      }),
      landedS: _.create(MarsRoverState.prototype, {
        direction: () => 'S',
        canForward: () => this.location.y > 0,
        canBack: () => this.location.y < this._world.h,
        forward: () => { if (this._state.canForward()) --this.location.y },
        back: () => { if (this._state.canBack()) ++this.location.y },
        left: () => this._state = this.states.landedE,
        right: () => this._state = this.states.landedW
      }),
      landedW: _.create(MarsRoverState.prototype, {
        direction: () => 'W',
        canForward: () => this.location.x > 0,
        canBack: () => this.location.x < this._world.w,
        forward: () => this._state.canForward() ? --this.location.x : this.location.x,
        back: () => this._state.canBack() ? ++this.location.x : this.location.x,
        left: () => this._state = this.states.landedS,
        right: () => this._state = this.states.landedN
      }),
    };
  }

  /**
   * states
   * - unknown: get world size then will transfor to state:'landing' 
   * - landing: get land location then will transfor to state:'landedX'
   * - landedN: face to North
   * - landedE: face to East
   * - landedS: face to South
   * - landedW: face to West
   */
  constructor() {
    this.states = this._buildStates();
    this.rules = this._buildCommandLineRules();

    this._world = { w: 0, h: 0 };
    this._location = { x: 0, y: 0 };
    this._state = this.states.unknown;
  }
}

class MarsRoverState {
  direction() { throw new Error('invalid operation'); }
  world() { throw new Error('invalid operation'); }
  land() { throw new Error('invalid operation'); }
  forward() { throw new Error('invalid operation'); }
  back() { throw new Error('invalid operation'); }
  left() { throw new Error('invalid operation'); }
  right() { throw new Error('invalid operation'); }
}

module.exports = MarsRover;