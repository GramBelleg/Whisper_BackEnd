pipeline {
    agent any

    options {
        disableConcurrentBuilds() 
        timeout(time: 2, unit: 'HOURS') 
    }

    environment {
        JOB_PATH = "/home/azureuser/Whisper_Devops/jenkins/jenkins_home/workspace/whisperBackend_${BRANCH_NAME}"
        DOCKER_PASS=credentials('dockerPassword') 
        GITHUB_CRED = credentials('githubCredential')
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
                cp /opt/backend/.env.test .env.test
                chmod +x ./scripts/unitTests.sh
                ./scripts/unitTests.sh > testsLogs.txt
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
                sh 'chmod +x scripts/deploy.sh'
                sh './scripts/deploy.sh'
            }
        }

    }
    post {
        always {
            emailext (
                    subject: "Build Notification: ${JOB_NAME} #${BUILD_NUMBER} [${BRANCH_NAME}]",
                    body: """
                        The build for ${BRANCH_NAME} has completed.
                        - Job Name: ${JOB_NAME}
                        - Build Number: ${BUILD_NUMBER}
                        - Build Status: ${currentBuild.result ?: 'SUCCESS'}
                
                    """,
                    to: "grambell.whisper@gmail.com",
                    attachmentsPattern: "testsLogs.txt"
            )
            echo 'Cleaning up the workspace...'
            cleanWs()
        }
    }   
}