#!/bin/bash
cd /var/www/velosmithnodeapp
npm install
pm2 start app.js || pm2 restart app
