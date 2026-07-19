FROM jenkins/jenkins:lts

USER root

##############################################
# Install Linux Packages
##############################################

RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    ca-certificates \
    gnupg \
    lsb-release

##############################################
# Install NodeJS 22
##############################################

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

RUN apt-get install -y nodejs

##############################################
# Install Docker CLI
##############################################

RUN apt-get install -y docker.io

##############################################
# Install kubectl
##############################################

RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

RUN install -m 0755 kubectl /usr/local/bin/kubectl

RUN rm kubectl

##############################################
# Install Helm
##############################################

RUN curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

##############################################
# Jenkins Plugins
##############################################

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt

RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

USER jenkins