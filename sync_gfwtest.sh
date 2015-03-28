#/bin/bash
cd "$(dirname "$0")"
git fetch gfwtest.js
wget http://autoproxy2pac.appspot.com/gfwtest.js -O gfwtest.js
git commit gfwtest.js -m "update `date '+%Y-%m-%d %H:%M:%S'`"
git push
date >> .sync.log
