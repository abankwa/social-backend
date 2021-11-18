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
cd /home/ec2-user/social-backend/dist/src
pm2 start app.js --name backend



