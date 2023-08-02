#!/bin/bash

# insatll deps
yarn

# build js
yarn build

# fail fast on any non-zero exits
set -e

# the docker image name and dockerhub repo
NAME="bnk-tracker"
REPO="boolnetwork"

# extract the current npm version from package.json
VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | sed 's/ //g')

echo "*** Building $NAME"
docker build -t $NAME -f Dockerfile .

docker login -u $REPO -p $DOCKER_PASS

echo "*** Tagging $REPO/$NAME"
if [[ $VERSION != *"beta"* ]]; then
  docker tag $NAME $REPO/$NAME:$VERSION
  docker push $REPO/$NAME:$VERSION
fi
docker tag $NAME $REPO/$NAME

echo "*** Publishing $NAME"
docker push $REPO/$NAME