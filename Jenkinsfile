pipeline {
    agent any
    environment {
        JOB_PATH = "/home/azureuser/Whisper_Devops/jenkins/jenkins_home/workspace/whisperBackend_${BRANCH_NAME}"
        DOCKER_PASS=credentials('dockerPassword') 
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('building') {
            steps {
                sh """
                echo "******* building ********"

                docker run --rm \
                    -v "$JOB_PATH:/app" -w /app \
                        node:18 /bin/bash \
                            -c "npm install && npm run build"
                """
            }
        }


        stage('testing') {
            steps {
                sh """
                echo "******* testing ********"
                """
            }
        }

        stage('pushing Image To Dockerhub') {
            when {
                branch 'Production'
            }
            steps {
                sh 'echo "******* pushing image ********"'
                sh 'echo $DOCKER_PASS | docker login -u grambell003 --password-stdin'
                sh 'cp /opt/backend/.env .env'
                sh 'docker-compose build backend'
                sh 'docker-compose push backend'
            }
        }

        stage('Deploying') {
            when {
                branch 'Production'
            }
            steps {
                sh """
                 echo "******* deploying ********"
                """
            }
        }

    }
    post {
        always {
            echo 'Cleaning up the workspace...'
            cleanWs()
        }
    }   
}