#/bin/bash
git fetch
wget http://autoproxy2pac.appspot.com/gfwtest.js -O gfwtest.js
git commit gfwtest.js -m "update `date '+%Y-%m-%d %H:%M:%S'`"
git push
