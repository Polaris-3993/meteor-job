String appName = 'vezio-core'
String repoUrl = 'git@bitbucket.org:vezio/vezio.git'
String repoCreds = '99e2a1ec-9cda-4eef-8cd6-b98b3f004272'
String settingsPath = 'config/settings/production.json'
String runtimeModules = 'babel-runtime braintree-web currency-codes iban pdfmake nouislider braintree'

def notifyBuild(String buildStatus) {
    // build status of null means successful
    buildStatus =  buildStatus ?: 'SUCCESSFUL'

    // Default values
    def colorCode = '#FFFFFF'
    def summary = "${buildStatus}: '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})"

    // Override default values based on build status
    if (buildStatus == 'SUCCESSFUL') {
        colorCode = '#36A64F'
    } else if (buildStatus == 'FAILURE') {
        colorCode = '#A63636'
    }

    // Send notifications
    slackSend (channel: "#vezio-core", color: colorCode, message: summary)
}


try {
    node {
        stage('Preparing source tree') {
            sh('rm -rf bundle/')
    
            dir('source') {
                git(credentialsId: repoCreds,
                        url: repoUrl,
                        branch: env.BRANCH_NAME)
            }
    
        }
    
        stage('Building sources') {
            dir('source') {
    
                try {
                    if (runtimeModules) {
                        sh("meteor npm install ${runtimeModules}")
                    }
                } catch (e) {
                    println "NOTICE: extra runtime modules are not defined"
                }
    
                sh('meteor build ../ --directory --architecture os.linux.x86_64 --server-only')
            }
    
            dir('bundle/programs/server') {
                sh('meteor npm install')
            }
        }

        stage('SonarQube analysis') {
            dir('source') {
                def scannerHome = tool 'sonscanner';
                withSonarQubeEnv('sonar.vezio.company') {
                    sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=${appName} -Dsonar.sources=."
                }
            }
        }

        stage('Packing artefact') {
    
            sh("cp source/${settingsPath} bundle/settings.json")
    
            dir('bundle') {
                sh("tar czf ../${appName}.tar.gz .")
            }
            archiveArtifacts("${appName}.tar.gz")
        }
    
    }
} catch (e) {
    currentBuild.result = "FAILURE"
    throw e
} finally {
    notifyBuild(currentBuild.result)
}
