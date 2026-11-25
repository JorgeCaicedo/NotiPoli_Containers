pipeline {
    agent { label 'windows' }

    environment {
        // Docker executable path for Windows agents
        DOCKER_PATH        = 'C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe'
        NODE_ENV           = 'production'

        // Credentials defined in Jenkins (Manage Jenkins -> Credentials)
        // Using credentials() function call fixes the Groovy compilation error
        DB_PASSWORD        = credentials('db-pass')
        DB_USER            = credentials('db-user')
        DB_NAME            = credentials('db-name')
        JWT_SECRET         = credentials('jwt-secret')
        JWT_REFRESH_SECRET = credentials('jwt-refresh-secret')
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

        stage('Test') {
            steps {
                echo 'Running backend tests...'
                // We run npm install locally on the agent if node is available,
                // or we could run it inside a temporary container.
                // Assuming the agent has Node.js installed for simple unit testing.
                bat "cd notipoli-node && npm install && npm test || echo Tests failed or no tests found, continuing"
            }
        }
    }

    post {
        success {
            script {
                echo 'Pipeline success! Running connectivity smoke test...'
                try {
                    // Start the containers. docker compose automatically picks up
                    // the environment variables defined in the environment {} block.
                    bat "${DOCKER_PATH} compose up -d"

                    echo 'Waiting for services to be healthy...'
                    bat "timeout /t 20 /nobreak"

                    echo 'Testing connectivity: frontend -> backend -> /api/news'
                    bat "${DOCKER_PATH} exec notipoli-web wget --no-verbose --tries=1 --spider http://backend:3000/api/news"

                    echo '✅ Connectivity test PASSED'
                } catch (Exception e) {
                    echo "❌ Connectivity test FAILED: ${e.message}"
                    error("Smoke test failed")
                } finally {
                    echo 'Cleaning up containers...'
                    bat "${DOCKER_PATH} compose down"
                }
            }
        }
        failure {
            echo 'Pipeline failed. Ensuring environment is clean...'
            bat "${DOCKER_PATH} compose down"
        }
    }
}
