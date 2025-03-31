pipeline {
    agent any
    
    tools {
        nodejs 'Node.js 20.9.0'
    }
    
    environment {
        EC2_USER = 'ubuntu'
        EC2_HOST = credentials('ec2-host')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
                sh 'ls -la' // List files to see what was created
                sh 'pwd'    // Show current directory
                sh 'ls -la ./dist' // Explicitly list dist directory contents
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    // Use the dist directory directly
                    def buildDir = './dist'
                    
                    if (buildDir) {
                        echo "Found build directory: ${buildDir}"
                        
                        // Debug: Check build directory contents
                        sh "ls -la ${buildDir}"
                        
                        // Ensure the build directory exists and has files
                        if (fileExists("${buildDir}/index.html")) {
                            echo "Build directory contains index.html"
                        } else {
                            error "index.html is missing from build directory. Deployment aborted."
                        }
                        
                        sshagent(['ec2-ssh-key']) {
                            // Create a tar file of the build
                            echo "Creating tar archive from: ${buildDir}"
                            sh "tar -czf build.tar.gz -C ${buildDir} ."
                            
                            // Verify tar was created
                            sh "ls -la build.tar.gz"
                            
                            // Copy it to the EC2 instance
                            echo "Copying tar to EC2 instance"
                            sh "scp -o StrictHostKeyChecking=no build.tar.gz ${EC2_USER}@${EC2_HOST}:/tmp/"
                            
                            // Extract and deploy on EC2
                            echo "Extracting and deploying on EC2"
                            sh """
                                ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                                    sudo rm -rf /var/www/frontend/*
                                    sudo mkdir -p /var/www/frontend
                                    sudo tar -xzf /tmp/build.tar.gz -C /var/www/frontend/
                                    rm /tmp/build.tar.gz
                                    sudo systemctl reload nginx
                                '
                            """
                        }
                    } else {
                        error "Build directory not found. Check your build process."
                    }
                }
            }
        }
    }
    
    post {
        failure {
            echo 'The pipeline failed. Check the build logs for details.'
        }
        success {
            echo 'Successfully built and deployed the application.'
        }
    }
}