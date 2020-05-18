#!/bin/bash

# cd into local production directory and pull master
cd ~/inter-net
git checkout master
git pull

# rebuild docker image
docker stop $(docker ps -a -q)
docker build -t inter-net .
docker run -p 8080:8080 -d inter-net

# start docker image
docker run -p 8080:8080 -d inter-net
