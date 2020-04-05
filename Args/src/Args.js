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
   * Define schema pattern
   * 
   * schema format:
   *   {flag}:{type} {flag}:{type} ... {flag}:{type}
   * 
   *   - flag: [A-Za-z0-9_-]
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
        let rule = _.find(this._rules, rule => rule.testSchema(element));
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
   *   -{flag}[:{value}] -{flag}[:{value}] ... -{flag}[:{value}]
   * 
   *   - flag: [A-Za-z0-9_-]
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
    this._flags = _
      .chain(command)
      .split(/-/)
      .map(_.trim)
      .compact()
      .reduce((result, element) => {
        let [flag] = element.split(/\s/);
        let rule = this._schema[flag];
        if (!rule) throw new Error(`command not match schema`);
        let value = null;
        try {
          value = rule.takeValue(element);
        } catch (error) {
          value = rule.defaultValue;
        }
        result[flag] = value;
        return result;
      }, {})
      .value();

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

    let value = null;
    if (_.has(this._flags, flag)) {
      value = this._flags[flag];
    } else {
      value = this._schema[flag].defaultValue;
    }

    return value;
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
        testCommand: () => { },
        takeValue: element => Number.parseInt(element.split(/\s/)[1])
      },
      {
        type: 'string',
        defaultValue: '',
        testSchema: element => element.match(/^[a-zA-Z-_]+:string$/),
        testCommand: () => { },
        takeValue: element => element.split(/\s/)[1]
      },
      {
        type: 'boolean',
        defaultValue: false,
        testSchema: element => element.match(/^[a-zA-Z-_]+:boolean$/),
        testCommand: () => { },
        takeValue: element => true
      },
    ];
  }
}

module.exports = Args;