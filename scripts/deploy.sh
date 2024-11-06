#!/bin/bash

echo $DOCKER_PASS > /tmp/.auth
echo $GITHUB_CRED_USR >> /tmp/.auth
echo $GITHUB_CRED_PSW >> /tmp/.auth


scp -i /opt/WhisperVm_key.pem /tmp/.auth azureuser@Whisper.webredirect.org:/tmp/.auth

echo "transfered secrets"

ssh -i /opt/WhisperVm_key.pem azureuser@Whisper.webredirect.org "cd Whisper_BackEnd && chmod +x scripts/remoteDeploy.sh && ./scripts/remoteDeploy.sh"

echo "finished running script"