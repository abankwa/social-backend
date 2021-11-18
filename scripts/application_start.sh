#!/bin/bash

cd /home/ec2-user/social-backend

#add npm and node to path for ec2-user
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ]  && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

sudo chown ec2-user /home/ec2-user/social-backend
sudo chmod -R 777 /home/ec2-user/social-backend

#install node modules
#npm ci


#reload app
#TODO add script to check if backend is already running, if so do a reload instead of
#deleting and starting
cd /home/ec2-user/social-backend/dist/src
pm2 delete backend
pm2 start /home/ec2-user/social-backend/dist/src/app.js --name backend



