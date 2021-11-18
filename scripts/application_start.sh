#!/bin/bash

cd /home/ec2-user/social-backend

#install node modules
npm ci

#reload app
pm2 reload backend

