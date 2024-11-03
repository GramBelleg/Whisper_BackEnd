pipeline {
    agent any
    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('building') {
            when{
                not {
                    branch 'Production'
                }
            }
            steps {
                sh """
                echo "**************************"
                echo "***building the project***"
                echo "**************************"
                """
            }
        }


        stage('testing') {
            when{
                not {
                    branch 'Production'
                }
            }
            steps {
                sh """
                echo "*************************"
                echo "***testing the project***"
                echo "*************************"
                """
            }
        }

        stage('pushing Image To Dockerhub') {
            when {
                branch 'Production'
            }
            steps {
                sh """
                echo "********************************"
                echo "***pushing image to dockerhub***"
                echo "********************************"
                """
            }
        }

        stage('Deploying') {
            when {
                branch 'Production'
            }
            steps {
                sh """
                echo "********************************"
                echo "*************deploying**********"
                echo "********************************"
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