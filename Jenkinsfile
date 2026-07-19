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
                echo 'Installing dependencies...'

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
                echo 'Skipping tests for now...'

                /*
                dir('auth-service') {
                    sh 'npm test'
                }

                dir('user-service') {
                    sh 'npm test'
                }

                dir('product-service') {
                    sh 'npm test'
                }
                */
            }
        }

        stage('Build Docker') {
            steps {
                echo 'Building Docker Images...'

                sh 'docker build -t firdousalam2058/auth-service:v1 ./auth-service'
                sh 'docker build -t firdousalam2058/user-service:v1 ./user-service'
                sh 'docker build -t firdousalam2058/product-service:v1 ./product-service'
            }
        }

        stage('Push Docker') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {

                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                        docker push firdousalam2058/auth-service:v1
                        docker push firdousalam2058/user-service:v1
                        docker push firdousalam2058/product-service:v1
                    '''
                }
            }
        }

        stage('Deploy Using Helm') {
            steps {
                echo 'Deploying with Helm...'

                sh 'helm upgrade --install microservice-app ./helm/microservices'
            }
        }

        stage('Verify') {
            steps {
                echo 'Verifying deployment...'

                sh 'kubectl get pods'
                sh 'kubectl get services'
                sh 'kubectl get ingress'
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed.'
        }

        success {
            echo 'Deployment Successful!'
        }

        failure {
            echo 'Deployment Failed!'
        }
    }
}