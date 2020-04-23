#!/bin/bash

# cd into local production directory and pull master
cd ~/inter-net
git checkout master
git pull

# update all packages
npm install

# build stylesheet
npm run build-stylesheet
