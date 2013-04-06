![broadcaster logo](http://i.imgur.com/kk7q0Ni.png)

## About

Rereddit is a NodeJS wrapper for interfacing with reddit.com's API.  It is built around [superagent](https://github.com/visionmedia/superagent) with a few extentions to its Request object for convenience.  This extension allows for requests to be made like so:

```js
rereddit.read('funny').limit(25).after('t3_a515a')
    .end(function(err, posts) {
        // Do something with posts.
    });
```

Rereddit also allows for accessing protected content, returning a `user` object from a successful call to `login` that can be stored within a session and passed back to the module when needed.

```js
rereddit.login('username', 'password').end(function(err, user) {
    rereddit.me().as(user)
        .end(function(err, details) {
            // Now we have the user's details. 
        });
});
```

## Usage

Install via NPM.

    $ npm install rereddit

Then simply require within your application.

```js
var rereddit = require('rereddit');
```
## API

#### read([item])
The `read` function takes an optional string as an argument, matching either a reddit thing id36, or subreddit name.  If no argument is present, rereddit assumes you wish to grab the front page posts of reddit.com.
#### login(username, password)
Login generates the initial post request and attaches the users credentials.  Calling `end` on a `login` request will return a `user` object containing the cookie to be set, as well as a data object holding the generated modhash and cookie details like so:

```js
{
    cookie: String,
    data: {
        modhash: String,
        cookie: String
    }
}
```

#### me()
A call to `me` generates an initialized request to grab the user's details. A call to `me` must be followed by a call to `as` (documented below) to pass along the required credentials with the request.

#### reddits()
Initializes a request to retrieve a list of subreddits from reddit.com.

#### comments(thread)
Initializes a request to fetch the comments for a `thread` (thread may be the fullname of a reddit thing, or just a things id only).  

#### comment(parent, text), reply(parent, text)
Initializes a request to post a comment to the specified `parent` thread with the given `text`.  An alias is provided as `reply` to allow for flavor.  *The `parent` id is expected to be in proper id36 format.*

#### vote(id, dir)
Initializes a request to cast a vote on the specified `id` in the given direction `dir`, which is a string (equal to up or down), or integer (1 or -1).  *The  `id` is expected to be in proper id36 format.*

#### inbox()
Returns the messages stored in a user's inbox.  The user is provided with a chained call to `me`.

#### unread()
Returns only the unread messages from a user's inbox.  The user is provided with a chained call to `me`.

#### sent()
Returns messages that the user has previously sent.  The user is provided with a chained call to `me`.

#### moreChildren(id, children)
Initializes a request to retrieve hidden comments.  `children` may be supplied as an array of strings or comma-delimited strings.  *The  `chidlren` are expected to be in proper id36 format.*

### Rereddit exposes [superagent's](https://github.com/visionmedia/superagent) Request object with a few additional convenience methods attached to each instance.

#### as(user)
The additional `as` method attached to the `Request` prototype simply fits the object with credentials to pass along to the reddit.com API.
#### limit(num)
Limit, as may be expected, is used for limiting the amount of results returned via a request geneerated by a call to `read`.
#### after(id)
As with `limit`, `after` simply tells the request that all results returned from a `read` request should follow after the specified id.  *The  `id` is expected to be in proper id36 format.*

### Release v0.1.0
