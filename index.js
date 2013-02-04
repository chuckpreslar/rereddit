
/**
 * Copyright (c) 2013 Chuck Preslar
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the Software 
 * is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
 * SOFTWARE.
 */

;(function() {

  /**
   * NPM module dependencies.
   */

  var request = require('superagent');

  /**
   * Rereddit module definition. 
   */

  var rereddit = module.exports = {};
  var base_url = rereddit.base_url = 'http://www.reddit.com/';
  var regex = rereddit.regex = /t[0-9]+_[a-z0-9]+/g;
  var types = rereddit.types = {
      t1: 'comment'
    , t2: 'account'
    , t3: 'link'
    , t4: 'message'
    , t5: 'subreddit'
  };

  var user = rereddit.user = undefined;

  /**
   * Parse arguments to ensure optional arguments
   * are interpreted correctly.
   *
   * @api private
   *
   * @param {Arguments} args The arguments to parse.
   * @returns {Object} The parsed arguments.
   */

  var _arguments = function(args) {
    var subreddit, limit, after, callback;
    for(var arg in args) {
      switch(typeof args[arg]) {
        case 'string': {
          if(args[arg].match(regex))
            after = args[arg];
          else if(parseInt(args[arg]))
            limit = args[arg];
          else
            subreddit = args[arg];
          break;
        }
        case 'number': {
          limit = args[arg];
          break;
        }
        case 'function': {
          callback = args[arg]
          break;
        }
        default: 
          break;
      }
    }
    return {
        subreddit: subreddit
      , limit: limit
      , after: after
      , callback: callback
    }
  };

  /**
   * Generates initial request object.
   *
   * @api private
   *
   * @param {String} type The request type.
   * @param {String} url The request url.
   * @returns {Request} The initialized request.
   */

  var _request = function(type, url) {
    if(arguments.length < 2 || !request[type])
      throw Error('Something has went horribly wrong.');
    var req = request[type](url)
      .set('Accept', 'application/json')
      .set('User-Agent', 'ReReddit - NodeJS reddit.com API Wrapper.');
    if(user && user.modhash && user.cookie)
      req = req.send({ uh: user.modhash }).query({ uh: user.modhash }).set('Cookie', user.cookie);
    return req;
  };

  /**
   * Retrieves posts from reddit.com and potential subreddits.
   *
   * @api public
   *
   * @param {String} [subreddit] The subreddit to retrieve posts from.
   * @param {Number} [limit] The number of posts to limit the result to.
   * @param {String} [after] The post all results should follow after.
   * @param {Function} callback Callback to fire once the request is resolved.
   */

  var get = rereddit.get = function(subreddit, limit, after, callback) {
    var args = _arguments(arguments);
    if(!args.callback)
      throw new Error('rereddit#get expects at minimum a callback argument.');
    var url = base_url + (args.subreddit ? 'r/' + args.subreddit : '') + '.json';
    var req = _request('get', url)
    if(args.limit)
      req = req.query({ limit: args.limit })
    if(args.after)
      req = req.query({ after: args.after })
    req.end(function(err, res) {
      if(err)
        return args.callback(err, undefined);
      return args.callback(undefined, res.body.data.children);
    });
  };

    /**
     * Retrieves a single post by its id.
     *
     * @api public
     *
     * @param {String} id The id of the post to retrieve.
     * @param {Function} callback Callback to fire once the request is resolved.
     */

    get.by_id = function(id, callback) {
      _request('get', base_url + 'by_id/' + id + '.json')
        .end(function(err, res) {
        if(err)
          return callback(err, undefined);
        return callback(undefined, res.body)
      });
    };

    /**
     * Retrieves comments for a signle post.
     *
     * @api public
     *
     * @param {String} id The id of the post to retrieve comments for.
     * @param {Function} callback Callback to fire once the request is resolved.
     */

    get.comments = function(id, callback) {
      id = id.match(regex) ? id.substr(3) : id;
      _request('get', base_url + 'comments/' + id + '.json')
        .end(function(err, res) {
          if(err)
            return callback(err, undefined);
          return callback(undefined, res.body)
        });
    };

  /**
   * Logs a user into reddit.com using the provided username and password.
   *
   * @api public
   *
   * @param {String} username The user's username.
   * @param {String} password The user's password.
   * @param {Function} callback The callback to fire once the request is resolved.
   */

  var login = rereddit.login = function(username, password, callback) {
    if(arguments.length < 3)
      throw new Error('rereddit#login expects a username, password, and callback as arguments - none are optional.');
    _request('post', base_url + 'api/login/' + username)
      .query({ user: username })
      .query({ passwd: password })
      .query({ api_type: 'json'})
      .send({ passwd: password, user: username, api_type: 'json' })
      .end(function(err, res) {
        if(err)
          return callback(err, undefined);
        if(res.body.json.errors.length > 0)
          return callback(res.body.json.errors, undefined);
        user = rereddit.user = { username: username, modhash: res.body.json.data.modhash, cookie: res.body.json.data.cookie }
        return callback(undefined, user);
      });
  };

  /**
   * Registers a user on reddit.com using the required credentials and
   * logs them in.
   * 
   * @api public
   *
   * NOTE: Not impletemented.
   */

  var register = rereddit.register = function() {}

  /**
   * Fetches public details provided about the user.
   * 
   * @api public
   *
   * @param {String} username The users's username to lookup.
   * @param {Function} callback The callback to fire once the request is resolved.
   */

  var about = rereddit.about = function(username, callback) {
    if(arguments.length < 2)
      throw new Error('rereddit#about expects a username, and callback as arguments - none are optional.');
    _request('get', base_url + 'user/' + username + '/about.json')
      .end(function(err, res) {
        if(err)
          return callback(err, undefined);
        return callback(undefined, res.body)
      });
  };

  /**
   * Fetches details about the current authorized user.
   *
   * @api public
   *
   * NOTE: Not impletemented.
   */

  var me = rereddit.me = function() {};

}())