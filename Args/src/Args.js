const debug = require('debug')('app:Args');
const _ = require('lodash');

/**
 * @class Args
 */
class Args {
  constructor() {
    this._buildRules();
    this._flags = {};
  }

  /**
   * return shcema size
   * @api @public
   */
  get schemaSize() {
    return _.keys(this._schema).length;
  }

  /**
   * Define schema pattern
   * 
   * schema format:
   *   {flag}:{type} {flag}:{type} ... {flag}:{type}
   * 
   *   - flag: [A-Za-z0-9_]
   *   - type: [object, integer, string, boolean, array]
   *   - split: [\s,]
   * 
   * Output:
   *   transform to this._schema when success, this._schema object schema:
   * 
   *   {
   *     type: 'object',
   *   }
   * 
   *   - key: flag
   *   - value: rule object
   * 
   * Exception: 
   *   - throw error ('schema format error') when schema doesn't match the rule
   * 
   * Examples:
   * 
   *   - l:boolean p:integer d:string
   *   - l:boolean, p:integer, d:string
   * 
   * Then transform to:
   *   this._schema = {
   *     l: this._rules[type:boolean],
   *     p: this._rules[type:integer],
   *     d: this._rules[type:string],
   *   }
   * 
   * @param {string} schema
   * @return {Args} - chainable
   * @api @public
   */
  schema(schema) {
    this._schema = _
      .chain(schema)
      .split(/[\s,]/)
      .map(_.trim)
      .compact()
      .reduce((result, element) => {
        let rule = _.find(this._rules, r => r.testSchema(element));
        if (!rule) throw new Error(`schema format error`);
        let [flag] = element.split(/:/);
        result[flag] = rule;
        return result;
      }, {})
      .value()

    return this;
  }

  /**
   * Parse command depends on _schema
   * 
   * command format:
   *   -{flag}[ {value}] -{flag}[ {value}] ... -{flag}[ {value}]
   * 
   *   - flag: [A-Za-z0-9_]
   *   - value: depends on it's type rule
   *   - split: [\s]
   * 
   * Output:
   *   transform to this._flags when success, this._flags object schema:
   * 
   *   {
   *     type: 'object',
   *   }
   * 
   *   - key: flag
   *   - value: value of flag
   * 
   * Exception: 
   *   - throw error ('command not match schema') when undefined flag occurs
   *   - throw error ('format error') when format not match with the rule
   * 
   * Examples:
   * 
   *   -l -p 8080 -d /usr/logs
   * 
   * Then transform to:
   *   this._flags = {
   *     l: false,
   *     p: 8080,
   *     d: '/usr/logs'
   *   }
   * 
   * @return {Args} - chainable
   * @api @public
   */
  parse(command) {
    let flags = {};

    // initial default values
    _.each(_.keys(this._schema), flag => { flags[flag] = this._schema[flag].defaultValue; });

    let it = this._slices(command)[Symbol.iterator]();
    let slice = null;
    while (!(slice = it.next()).done) {
      if (!(slice.value.length > 1 && slice.value.startsWith('-'))) {
        throw new Error('invalid command, flag should start with \'-\'');
      }

      let flag = slice.value.slice(1);
      let rule = this._schema[flag];
      if (!rule) throw new Error('invalid command, flag not found');
      flags[flag] = rule.take(it);
    }

    this._flags = flags;

    return this;
  }

  /**
   * get flag value
   * @param {string} flag
   * @example l
   * @api @public
   */
  get(flag) {
    if (!_.has(this._schema, flag)) throw new Error('flag not defined in schema');
    if (!_.has(this._flags, flag)) throw new Error('command parse error');

    return this._flags[flag];
  }

  /**
   * transform command to slices
   * 
   * -l -p 8080 -d /usr/logs/ -t 'hello world -x' -k -80
   * will transform to:
   * ['-l', '-p', '8080', '-d', '/usr/logs/', '-t', 'hello world -x', '-k', '-80']
   * 
   * logical:
   * 1. stop when meet [\s] && first char is not ['"]
   * 2. stop when meet ['"] && first char is ['"]
   * @api @private
   */
  _slices(command) {
    let result = [];

    let currentSlice = null;

    for (let char of command) {
      // open?
      if (!currentSlice && !char.isWhiteSpace()) {
        currentSlice = {
          buffer: !char.isQuotationMark() ? [char] : [],
          tag: char.isQuotationMark() ? char : null,
          commit: function () {
            result.push(this.buffer.join(''));
          }
        };
        continue;
      }

      // close?
      if (currentSlice) {
        if (currentSlice.tag) {
          if (char === currentSlice.tag) {
            currentSlice.commit();
            currentSlice = null;
            continue;
          }
        } else {
          if (char.isWhiteSpace()) {
            currentSlice.commit();
            currentSlice = null;
            continue;
          }
        }
      }

      // follow?
      if (currentSlice) {
        currentSlice.buffer.push(char);
      }
    }

    // close the last slice
    if (currentSlice) {
      if (currentSlice.tag) {
        throw new Error("missing closed tag (')");
      }
      currentSlice.commit();
    }

    return result;
  }

  /**
   * build knowledage level for schema rules
   * - integer
   * - string
   * - boolean
   * - array
   * @api @private
   */
  _buildRules() {
    this._rules = [
      {
        type: 'integer',
        defaultValue: 0,
        testSchema: element => element.match(/^[a-zA-Z-_]+:integer$/),
        take: it => {
          let value = Number.parseInt(it.next().value);
          if (Number.isNaN(value) || typeof value === 'undefined' || value == null) {
            throw new Error('wrong integer format');
          }
          return value;
        }
      },
      {
        type: 'string',
        defaultValue: '',
        testSchema: element => element.match(/^[a-zA-Z0-9_]+:string$/),
        take: it => {
          let value = it.next().value;
          if (typeof value === 'undefined' || value === null || value.trim().length === 0) {
            throw new Error('wrong string format');
          }
          return value;
        }
      },
      {
        type: 'boolean',
        defaultValue: false,
        testSchema: element => element.match(/^[a-zA-Z0-9_]+:boolean$/),
        take: it => true
      },
      {
        type: 'array',
        defaultValue: [],
        testSchema: element => element.match(/^[a-zA-Z0-9_]+:array$/),
        take: it => {
          let value = it.next().value;
          if (typeof value === 'undefined' || value === null || value.trim().length === 0) {
            throw new Error('wrong array format');
          }

          return value.split(',');
        }
      }
    ];
  }
}

String.prototype.isQuotationMark = function () { return ['"', "'"].includes(this.toString()); }
String.prototype.isWhiteSpace = function () { return [' ', '\t'].includes(this.toString()); }

module.exports = Args;