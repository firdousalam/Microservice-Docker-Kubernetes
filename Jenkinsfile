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
                 echo 'Install'
                dir('auth-service') {
                    sh 'npm install'
                }

                dir('user-service') {
                    sh 'npm install'
                }

                dir('product-service') {
                    sh 'npm install'
                }
            }
        }

        stage('Test') {
           
            steps {
                 echo 'Test'
            //     dir('auth-service') {
            //         sh 'npm test'
            //     }

            //     dir('user-service') {
            //         sh 'npm test'
            //     }

            //     dir('product-service') {
            //         sh 'npm test'
            //     }
             }
        }

        stage('Build Docker') {
            steps {
                sh 'docker build -t firdousalam2058/auth-service:v1 ./auth-service'
            }
        }

        stage('Push Docker') {
            steps {
                sh 'docker push firdousalam2058/auth-service:v1'
            }
        }

        stage('Deploy Using Helm') {
            steps {
                sh 'helm upgrade --install microservice-app ./helm/microservices'
            }
        }

        stage('Verify') {
            steps {
                sh 'kubectl get pods'
                sh 'kubectl get services'
            }
        }
    }
}