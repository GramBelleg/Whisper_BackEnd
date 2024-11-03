pipeline {
    agent any
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

                docker run --rm -v $WORKSPACE:/app -w /app node:18 npm install && npm run build
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
                sh """
                echo "******* pushing image ********"
                """
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