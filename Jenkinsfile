pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Install') {
            steps {
                npm install
                echo 'Installing dependencies...'
            }
        }

        stage('Test') {
            steps {
                npm test
                echo 'Running tests...'
            }
        }

        stage('Build Docker') {
            steps {
                echo 'Building Docker images...'
                bat "docker build -t firdousalam2058/auth-service:v1 ./auth-service"
            }
        }

        stage('Push Docker') {
            steps {
                echo 'Pushing Docker images...'
                bat "docker push firdousalam2058/auth-service:v1"
            }
        }

        stage('Deploy Using Helm') {
            steps {
                echo 'Deploying using Helm...'
                bat "helm upgrade --install microservice-app ./helm/microservices"
            }
        }

        stage('Verify') {
            steps {
                echo 'Verifying deployment...'
                bat "kubectl get pods"
                bat "kubectl get services"
            }
        }
    }
}