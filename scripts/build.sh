#!/bin/bash

# Current script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR=$SCRIPT_DIR/..

pushd $ROOT_DIR

docker build --build-arg GIT_SHA=${GITHUB_SHA} . -t registry.digitalocean.com/streetbot/signaler:build-${GITHUB_SHA}
docker tag registry.digitalocean.com/streetbot/signaler:build-${GITHUB_SHA} registry.digitalocean.com/streetbot/signaler:latest

popd
