pipeline {
    agent any

    environment {
        // Docker executable path for Windows agents
        DOCKER_PATH        = '"C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe"'
        NODE_ENV           = 'production'

        // Credentials defined in Jenkins (Manage Jenkins -> Credentials)
        // Using credentials() function call fixes the Groovy compilation error
        DB_PASSWORD        = credentials('DB_PASSWORD')
        DB_USER            = credentials('DB_USER')
        DB_NAME            = credentials('DB_NAME')
        JWT_SECRET         = credentials('JWT_SECRET')
        JWT_REFRESH_SECRET = credentials('JWT_REFRESH_SECRET')
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Building Docker images with Docker Compose...'
                bat "${DOCKER_PATH} compose build"
            }
        }

        stage('SmokeTest') {
            steps {
                echo 'Running connectivity smoke test...'
                bat "${DOCKER_PATH} compose up -d"
                echo 'Waiting for services to be healthy...'
                bat "ping 127.0.0.1 -n 15 >nul"
                echo 'Testing connectivity: frontend -> backend -> /api/news'
                bat 'curl -sSf http://localhost:3000/api/news || exit /b 1'
                echo '✅ Connectivity test PASSED'
            }
        }
    }

    post {
        always {
            echo 'Cleaning up containers...'
            bat "${DOCKER_PATH} compose down"
        }
    }
}
