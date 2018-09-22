pipeline {
  agent { label "common_slave" }

  options {
    buildDiscarder(logRotator(numToKeepStr:'10'))
    disableConcurrentBuilds()
  }

  parameters {
    string(defaultValue: "master", description: 'Backend branch?', name: 'CORE_BRANCH')
    string(defaultValue: "master", description: 'Tests branch?', name: 'TESTS_BRANCH')
    string(defaultValue: "master", description: 'Filestorage branch?', name: 'FILESTORAGE_BRANCH')
    string(defaultValue: "master", description: 'Report branch?', name: 'REPORT_BRANCH')
    string(defaultValue: "master", description: 'Report frontend branch?', name: 'REPORT_FRONTEND_BRANCH')
    string(defaultValue: "master", description: 'Security branch?', name: 'SECURITY_BRANCH')
  }

  triggers {
    cron('H 1 * * *')
  }

  environment {
    ARTIFACTORY = credentials("artifactory")
    ARTIFACTORY_USER = "${ARTIFACTORY_USR}"
    ARTIFACTORY_PASS = "${ARTIFACTORY_PSW}"
    BITBUCKET_CRED = credentials("bitbucket-basic")
    BITBUCKET_USER = "${BITBUCKET_CRED_USR}"
    BITBUCKET_PASS = "${BITBUCKET_CRED_PSW}"
    REGISTRY = credentials("docker-registry")
  }

  stages {
    stage('prepare job'){
      steps{
        sh 'docker login registry.infotech.team -u ${REGISTRY_USR} -p ${REGISTRY_PSW}'
      }
    }

    stage('prepare images'){
      failFast true
      parallel {

        stage('Core. Retag from latest'){
          when{
            environment name: 'CORE_BRANCH', value: 'master'
          }
          steps{
            sh 'docker pull registry.infotech.team/backend/references-core:latest'
            sh 'docker tag registry.infotech.team/backend/references-core:latest registry.infotech.team/backend/references-core:tests'
            sh 'docker push registry.infotech.team/backend/references-core:tests'
          }
        }

        stage('Core. Build') {
          when{
            not { environment name: 'CORE_BRANCH', value: 'master' }
          }
          agent {
            docker {
              image 'registry.infotech.team/devops/maven:mapissues'
              args '-u root \
                    -v /home/jenkins/.ssh:/root/.ssh:ro \
                    -v references-core-stands:/root/.m2/repository \
                    -v /var/run/docker.sock:/var/run/docker.sock:ro \
                    -v /usr/bin/docker:/usr/bin/docker:ro '
            }
          }
          steps {
            git url: 'ssh://git@bitbucket.infotech.team:7999/ref/references-core.git', branch: '${CORE_BRANCH}'
            sh 'mvn --builder smart --quiet -T 8C -B clean package -Pdist'
            sh 'unzip -o reference-rest/target/*reference-rest*.zip'
            sh 'docker login registry.infotech.team -u ${REGISTRY_USR} -p ${REGISTRY_PSW}'
            sh 'docker build -t registry.infotech.team/backend/references-core:tests .'
            sh 'docker push registry.infotech.team/backend/references-core:tests'
          }
          post {
            always {
              sh 'rm -Rf * .[a-z]*'
            }
          }
        }

        stage('Filestorage. Retag from latest'){
          when{
            environment name: 'FILESTORAGE_BRANCH', value: 'master'
          }
          steps{
            sh 'docker pull registry.infotech.team/backend/filestorage-service:latest'
            sh 'docker tag registry.infotech.team/backend/filestorage-service:latest registry.infotech.team/backend/filestorage-service:tests'
            sh 'docker push registry.infotech.team/backend/filestorage-service:tests'
          }
        }

        stage('Filestorage. Build') {
          when{
            not { environment name: 'FILESTORAGE_BRANCH', value: 'master' }
          }
          agent {
            docker {
              image 'registry.infotech.team/devops/maven:mapissues'
              args '-u root \
                    -v /home/jenkins/.ssh:/root/.ssh:ro \
                    -v filestorage-stands:/root/.m2/repository \
                    -v /var/run/docker.sock:/var/run/docker.sock:ro \
                    -v /usr/bin/docker:/usr/bin/docker:ro '
            }
          }
          steps {
            git url: 'ssh://git@bitbucket.infotech.team:7999/inf/filestorage-service.git', branch: '${FILESTORAGE_BRANCH}'
            sh 'mvn -B clean package play2:dist-exploded play2:dist'
            sh 'docker login registry.infotech.team -u ${REGISTRY_USR} -p ${REGISTRY_PSW}'
            sh 'docker build -t registry.infotech.team/backend/filestorage-service:tests --build-arg GIT_COMMIT=`git rev-parse HEAD` .'
            sh 'docker push registry.infotech.team/backend/filestorage-service:tests'
          }
          post {
            always {
              sh 'rm -Rf * .[a-z]*'
            }
          }
        }

        stage('Security. Retag from latest'){
          when{
            environment name: 'SECURITY_BRANCH', value: 'master'
          }
          steps{
            sh 'docker pull registry.infotech.team/backend/reference-security:latest'
            sh 'docker tag registry.infotech.team/backend/reference-security:latest registry.infotech.team/backend/reference-security:tests'
            sh 'docker push registry.infotech.team/backend/reference-security:tests'
          }
        }

        stage('Security. Build') {
          when{
            not { environment name: 'SECURITY_BRANCH', value: 'master' }
          }
          agent {
            docker {
              image 'registry.infotech.team/devops/maven:mapissues'
              args '-u root \
                    -v /home/jenkins/.ssh:/root/.ssh:ro \
                    -v security-stands:/root/.m2/repository \
                    -v /var/run/docker.sock:/var/run/docker.sock:ro \
                    -v /usr/bin/docker:/usr/bin/docker:ro '
            }
          }
          steps {
            git url: 'ssh://git@bitbucket.infotech.team:7999/ref/reference-security.git', branch: '${SECURITY_BRANCH}'
            sh 'mvn --builder smart --quiet -T 8C -B clean package -Pdist'
            sh 'unzip -o reference-security-core/target/com.infotechcorp.reference.reference-security-core*.zip'
            sh 'docker login registry.infotech.team -u ${REGISTRY_USR} -p ${REGISTRY_PSW}'
            sh 'docker build -t registry.infotech.team/backend/reference-security:tests --build-arg GIT_COMMIT=`git rev-parse HEAD` .'
            sh 'docker push registry.infotech.team/backend/reference-security:tests'
          }
          post {
            always {
              sh 'rm -Rf * .[a-z]*'
            }
          }
        }

        stage('Report. Retag from latest'){
          when{
            environment name: 'REPORT_BRANCH', value: 'master'
          }
          steps{
            sh 'docker pull registry.infotech.team/backend/report-generator:latest'
            sh 'docker tag registry.infotech.team/backend/report-generator:latest registry.infotech.team/backend/report-generator:tests'
            sh 'docker push registry.infotech.team/backend/report-generator:tests'
          }
        }

        stage('Report. Build') {
          when{
            not { environment name: 'REPORT_BRANCH', value: 'master' }
          }
          agent {
            docker {
              image 'registry.infotech.team/devops/maven:mapissues'
              args '-u root \
                    -v /home/jenkins/.ssh:/root/.ssh:ro \
                    -v report-stands:/root/.m2/repository \
                    -v /var/run/docker.sock:/var/run/docker.sock:ro \
                    -v /usr/bin/docker:/usr/bin/docker:ro '
            }
          }
          steps {
            git url: 'ssh://git@bitbucket.infotech.team:7999/ref/reference-report-generator.git', branch: '${REPORT_BRANCH}'
            sh 'mvn --builder smart --quiet -T 8C -B clean package -Pdist'
            sh 'unzip -o target/reference-report-generator*.zip'
            sh 'docker login registry.infotech.team -u ${REGISTRY_USR} -p ${REGISTRY_PSW}'
            sh 'docker build -t registry.infotech.team/backend/report-generator:tests --build-arg GIT_COMMIT=`git rev-parse HEAD` .'
            sh 'docker push registry.infotech.team/backend/report-generator:tests'
          }
          post {
            always {
              sh 'rm -Rf * .[a-z]*'
            }
          }
        }

        stage('Report frontend. Retag from latest'){
          when{
            environment name: 'REPORT_FRONTEND_BRANCH', value: 'master'
          }
          steps{
            sh 'docker pull registry.infotech.team/frontend/report-generator-ui-stub:latest'
            sh 'docker tag registry.infotech.team/frontend/report-generator-ui-stub:latest registry.infotech.team/frontend/report-generator-ui-stub:tests'
            sh 'docker push registry.infotech.team/frontend/report-generator-ui-stub:tests'
          }
        }

        stage('Report frontend. Build') {
          when{
            not { environment name: 'REPORT_FRONTEND_BRANCH', value: 'master' }
          }
          agent {
            docker {
              image 'node'
              args '-u root \
                    -v /home/jenkins/.ssh:/root/.ssh:ro \
                    -v /var/run/docker.sock:/var/run/docker.sock:ro \
                    -v /usr/bin/docker:/usr/bin/docker:ro '
            }
          }
          steps {
            git url: 'ssh://git@bitbucket.infotech.team:7999/ref/reference-report-generator-ui.git', branch: '${REPORT_FRONTEND_BRANCH}'
            sh 'echo registry=http://nexus.infotech.team/repository/npm/ > .npmrc'
            sh 'echo always-auth=true >> .npmrc'
            sh "echo _auth=bnBtLXB1bGw6WGRENGpxVWNrdG8= >> .npmrc"
            sh 'npm run bundle'
            sh 'docker login registry.infotech.team -u ${REGISTRY_USR} -p ${REGISTRY_PSW}'
            sh 'docker build -t registry.infotech.team/frontend/report-generator-ui-stub:tests .'
            sh 'docker push registry.infotech.team/frontend/report-generator-ui-stub:tests'
          }
          post {
            always {
              sh 'rm -Rf * .[a-z]*'
            }
          }
        }
      }
    }

    stage('run stand') {
      steps{
        sh 'ssh -o StrictHostKeyChecking=no jenkins@references-tests.infotech.team "cd /srv/references-tests && git pull "'
        sh 'ssh -o StrictHostKeyChecking=no jenkins@references-tests.infotech.team "cd /srv/references-tests && cp .env.test-stand .env && docker-compose pull"'
        sh 'ssh -o StrictHostKeyChecking=no jenkins@references-tests.infotech.team "cd /srv/references-tests && docker-compose down -v"'
        sh 'ssh -o StrictHostKeyChecking=no jenkins@references-tests.infotech.team "cd /srv/references-tests && docker-compose up -d"'
      }
    }

    stage('check backend') {
      steps{
        timeout(time: 5, unit: "MINUTES") {
          waitUntil {
            script {
              def r = sh script: """
              #!/bin/bash
              wget -q http://references-tests.infotech.team:9100 -O /dev/null
              """, returnStatus: true
              return (r==0)
            }
          }
        }
      }
    }

    stage('add data') {
      agent {
        docker {
          image 'registry.infotech.team/devops/maven:mioek'
          args '-u root \
                -v /home/jenkins/.ssh:/root/.ssh:ro \
                -v /var/run/docker.sock:/var/run/docker.sock:ro \
                -v /usr/bin/docker:/usr/bin/docker:ro '
        }
      }
      steps {
        git url: 'ssh://git@bitbucket.infotech.team:7999/ref/references-core.git', branch: '${CORE_BRANCH}'
        sh "curl -fSL https://github.com/stoplightio/prism/releases/download/v2.0.9/prism_linux_amd64 -o /usr/bin/prism"
        sh 'chmod +x /usr/bin/prism'
        sh 'wget https://github.com/stedolan/jq/releases/download/jq-1.5/jq-linux64 -O /usr/bin/jq && chmod +x /usr/bin/jq'
        sh 'cd reference-rest/src/it/stoplight && ./add-test-data http://references-tests.infotech.team/api/core http://references-tests.infotech.team/api/security/login reference@example.com reference'
      }
      post {
        always {
          sh 'rm -Rf * .[a-z]*'
        }
      }
    }

    stage('Run tests') {
      agent {
        docker {
          image 'registry.infotech.team/devops/xvfb-java'
          args '-u root \
                -v /home/jenkins/.ssh:/root/.ssh:ro \
                -v /var/run/docker.sock:/var/run/docker.sock:ro \
                -v /usr/bin/docker:/usr/bin/docker:ro'
        }
      }
      steps {
        git url: 'ssh://git@bitbucket.infotech.team:7999/ref/report-generator-ui-tests.git', branch: '${TESTS_BRANCH}'
        sh "echo http://references-tests.infotech.team"
        sh "export JAVA_OPTS='-Duser.country=RU -Duser.language=ru -Duser.timezone=Europe/Moscow'; ./gradlew test -Phost=http://report.references-tests.infotech.team -PsecurityHost=http://references-tests.infotech.team/api/security"
      }
      post {
        always {
          archive "build/reports/tests/**/*"
        }
        success {
          sh 'rm -Rf *'
        }
        failure {
          sh 'rm -Rf *'
        }
      }
    }

  }
  post {
    success {
      sh 'rm -Rf *'
      slackSend channel: '#reference', color: 'good', message: ":charmander: ${env.JOB_NAME}, <${env.BUILD_URL}|Build>"
    }
    failure {
      sh 'rm -Rf *'
      slackSend channel: '#reference', color: 'danger', message: ":travolta: ${env.JOB_NAME}, <${env.BUILD_URL}|Build>, <${env.BUILD_URL}/artifact/build/reports/tests/test/index.html|Report>"
    }
    aborted {
      sh 'rm -Rf *'
      slackSend channel: '#reference', color: 'warning', message: ":unacceptable: ${env.JOB_NAME}, <${env.BUILD_URL}|Build>"
    }
  }
}
