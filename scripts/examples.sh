#!/bin/sh

# Exit on any error (except unbound variables)
set -eo pipefail

if [ -z "$1" ]; then
    ./scripts/examples.sh cjs-ts
    ./scripts/examples.sh esm-ts
    ./scripts/examples.sh cjs
    ./scripts/examples.sh esm
    exit
fi

pushd examples/$1
npx ts-node ../../src/gen/cli
npx playwright test
popd