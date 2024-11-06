#!/bin/bash

export DOCKER_PASS=$(sed -n '1p' /tmp/.auth)
export GITHUB_CRED_USR=$(sed -n '2p' /tmp/.auth)
export GITHUB_CRED_PSW=$(sed -n '3p' /tmp/.auth)

cd /home/azureuser/Whisper_BackEnd

git pull https://$GITHUB_CRED_USR:$GITHUB_CRED_PSW@github.com/GramBelleg/Whisper_BackEnd.git Production

docker login -u grambell003 -p $DOCKER_PASS

docker-compose down

docker-compose pull backend

docker-compose up -d backend

echo "lastest deployment of backend at time $(date)" > log.txt