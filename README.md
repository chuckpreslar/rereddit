![broadcaster logo](http://i.imgur.com/kk7q0Ni.png)

Node wrapper for reddit.com's API.


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