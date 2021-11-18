#!/bin/bash

DIR="/home/ec2-user/social-backend"
if [ -d "$DIR" ]; then 
    echo "$DIR exists"
else 
    echo "creating directory $DIR"
    mkdir $DIR
fi

#this doesn't work here; only works in ApplicationStart hook
#sudo chown ec2-user /home/ec2-user/social-backend
#sudo chmod -R 777 $DIR

