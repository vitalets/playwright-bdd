#!/bin/sh

if [ -z "$1" ]; then
    ./scripts/run-examples.sh cjs-ts
    ./scripts/run-examples.sh esm-ts
    ./scripts/run-examples.sh cjs
    ./scripts/run-examples.sh esm
    exit
fi

pushd examples/$1
npx ts-node ../../src/gen/cli
npx playwright test
popd