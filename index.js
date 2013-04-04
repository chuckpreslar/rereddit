
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

  var superagent = require('superagent')
    , Request = superagent.Request;

  /**
   * Rereddit module definition. 
   */

  var rereddit = module.exports = {};

  /**
   * Rereddit helpers.
   */

  var base_url = rereddit.base_url = 'http://www.reddit.com/';
  var store = {};
  var thing = rereddit.thing = {};
  thing.regex = /t[0-9]+_[a-z0-9]+/g;
  thing.types = {
      t1: 'comment'
    , t2: 'account'
    , t3: 'link'
    , t4: 'message'
    , t5: 'subreddit'
  };

  /**
   * Modifiy the Request constructor for further convenience
   * methods.
   */

  if(!Request.prototype.hasOwnProperty('as'))
    Request.prototype.as = function(user) {
      if(typeof user === 'undefined' || !user.cookie || !user.data)
        return this;
      this.set('cookie', user.cookie);
      this.send({ uh: user.data.uh });
      this.query({ uh: user.data.uh });
      return this;
    }

  if(!Request.prototype.hasOwnProperty('limit'))
    Request.prototype.limit = function(num) {
      if(!this.method === 'GET') return this;
      if(!(num = parseInt(num))) return this;
      this.query({ limit: num });
      return this;
    }

  if(!Request.prototype.hasOwnProperty('after'))
    Request.prototype.after = function(id) {
      if(!this.method === 'GET') return this;
      if(id.match(thing.regex)) return this;
      this.query({ after: id });
      return this;
    }

  /**
   * Overwrite end so we can only send the body of the
   * request to the callback and set default.
   */

  Request.prototype._end = Request.prototype.end;
  Request.prototype.end = function(callback) {
    var self = this;
    this.set('accept', 'application/json');
    this.set('user-agent', 'rereddit - A NodeJS wrapper for reddit.com.');
    this.query({ 'api_type': 'json' });
    this._end(function(err, res) {
      if(!self.authorizing)
        return callback(err, res.body);
      if(!res.body.json.data || !res.header['set-cookie'] || res.body.json.errors.length > 0)
        return callback(new Error('Something went seriously wrong.'), res);
      return callback(err, { data: res.body.json.data, cookie: res.header['set-cookie'] });
    });
  };

  /**
   * Initializes a request to read the given item from reddit.com.
   *
   * @api public
   * @param {String} [item] The item to read.
   * @returns {Request} The initialized request.
   */

  rereddit.read = function(item) {
    if(typeof item === 'undefined') return superagent.get(base_url + '.json');
    if(item.match(thing.regex)) return superagent.get(base_url + 'by_id/' + item + '.json');
    return superagent.get(base_url + 'r/' + item + '.json');
  };

  /**
   * Initializes a request to log a user into reddit.com.
   *
   * @api public
   * @param {String} username The user's username.
   * @param {String} password The user's password.
   * @returns {Request} The initialized request.
   */

  rereddit.login = function(username, password) {
    if(!username || !password) return this;
    var req = superagent.post(base_url + 'api/login/' + username)
      .query({ 'user': username })
      .query({ 'passwd': password })
      .send({ passwd: password, user: username, api_type: 'json' });
    req.authorizing = true;
    return req;
  };

  /**
   * Initializes a request to retrieve a user's details from reddit.com.
   *
   * @api public
   * @returns {Request} The initialized request.
   */

  rereddit.me = function() {
    return superagent.get(base_url + 'api/me.json');
  };

  /**
   * Initializes a request to retrieve a list of subreddits.
   *
   * @api public
   * @returns {Request} The initialized request.
   */

  rereddit.reddits = function() {
    return superagent.get(base_url + 'reddits.json');
  };

  /**
   * Initializes a request to retrieve a user's unread messages.
   *
   * @api public
   * @returns {Request} The initialized request.
   */

  rereddit.unread = function() {
    return superagent.get(base_url + 'message/unread.json');
  };

  /**
   * Initializes a request to comment on a thread, message, or another comment.
   *
   * @api public
   * @param {String} [parent] The 'fullname' of the thing to comment on.
   * @param {String} [text] The text body of the comment.
   * @returns {Request} The initialized request.
   */

  rereddit.comment = function(parent, text) {
    return superagent.post(base_url + 'api/comment')
      .query({ 'parent': parent })
      .query({ 'text': text });
  };

}())
