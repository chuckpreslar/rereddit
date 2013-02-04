![broadcaster logo](http://i.imgur.com/kk7q0Ni.png)

## Usage
Install via NPM.

    $ npm install rereddit

Then simply require within your application.

```js
var rereddit = require('rereddit');
```
## API

###rereddit.get([subreddit], [limit], [after], callback)

Retrieves posts from reddit.com and potential subreddits.  All arguments are optional, with the exception of the callback, and can be applied in any order.

```js
rereddit.get('funny', 5, 't3_a515a', function(err, posts) {
  // Do something with the posts array.
});
```

###rereddit.get.by_id(id, callback)

Retrieves a single post based on its' thing `type` and `id36` name from reddit.com

```js
rereddit.get.by_id('t3_a515a', function(err, post) {
  // Do something with the single post.
});
```

###rereddit.get.comments(id, callback)

Retrieves comments for a single post.

```js
rereddit.get.comments('t3_a515a' /* All that's needed is the id36 of `a515a` */, function(err, post) {
  // Do something with the single post.
});
```
