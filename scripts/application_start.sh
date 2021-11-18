#!/bin/bash

cd /home/ec2-user/social-backend

#install node modules
npm ci

#reload app
cd /home/ec2-user/social-backend/dist/src
pm2 start app.js --name backend



