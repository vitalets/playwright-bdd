#!/bin/bash

# Exit on any error
set -euo pipefail

rm -rf ./dist
npx tsc -p tsconfig.build.json

# copy dist to 'test/node_modules/playwright-bdd' to allow import from 'playwright-bdd' in tests
rm -rf ./test/node_modules/playwright-bdd
mkdir -p ./test/node_modules/playwright-bdd
cp -R ./dist ./test/node_modules/playwright-bdd/
cp ./package.json ./test/node_modules/playwright-bdd/package.json
