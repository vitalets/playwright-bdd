#!/bin/bash

# Exit on any error (except unbound variables)
set -eo pipefail

if [ -z "$1" ]; then
    ./scripts/examples.sh playwright-style
    ./scripts/examples.sh cucumber-style
    exit
fi

pushd examples/$1
npx bddgen && npx playwright test
popd