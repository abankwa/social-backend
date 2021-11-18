#!/bin/bash

cd /home/ec2-user/social-backend

#add npm and node to path
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ]  && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

#install node modules
sudo npm ci


#reload app
cd /home/ec2-user/social-backend/dist/src
sudo pm2 start app.js --name backend



