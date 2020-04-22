#!/bin/bash

# cd into local production directory and pull master
cd ~/inter-net
git checkout maater
git pull

# build stylesheet
npm run build-stylesheet
