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
    var url = base_url + (args.subreddit ? 'r/' + args.subreddit : '') + '.json' +
      (args.limit || args.after ? '?' + 
      (args.limit && args.after ? 'limit=' + args.limit + '&after=' + args.after : 
      args.limit ? 'limit=' + args.limit : 'after=' + args.after) : '');
    var req = request.get(url)
      .set('Accept', 'application/json')
      .set('User-Agent', 'ReReddit NodeJS API.');
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
      request.get(base_url + 'by_id/' + id + '.json')
        .set('Accept', 'application/json')
        .set('User-Agent', 'ReReddit NodeJS API.')
        .end(callback);
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
      request.get(base_url + 'comments/' + id + '.json')
        .set('Accept', 'application/json')
        .set('User-Agent', 'ReReddit NodeJS API.')
        .end(callback);
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
    request.post(base_url + 'api/login/' + username)
      .set('Accept', 'application/json')
      .set('User-Agent', 'ReReddit NodeJS API.')
      .query({ user: username })
      .query({ passwd: password })
      .query({ api_type: 'json'})
      .send({ passwd: password, user: username, api_type: 'json' })
      .end(function(err, res) {
        console.log(res);
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
   */

  var about = rereddit.about = function(username, callback) {
    if(arguments.length < 2)
      throw new Error('rereddit#about expects a username, and callback as arguments - none are optional.');
    request.get(base_url + 'user/' + username + '/about.json')
      .set('Accept', 'application/json')
      .set('User-Agent', 'ReReddit NodeJS API.')
      .end(callback);
  };

}())