#!/bin/bash

# Exit on any error
set -euo pipefail

rm -rf ./dist
npx tsc -p tsconfig.build.json

# copy 'dist' to 'node_modules/playwright-bdd' to allow import from 'playwright-bdd' in tests
# todo: better to copy to 'test/node_modules/playwright-bdd', 
# as from the root node_modules this package is cleared on every npm install <some-package>
rm -rf ./node_modules/playwright-bdd
mkdir -p ./node_modules/playwright-bdd
cp -R ./dist ./node_modules/playwright-bdd/
cp ./package.json ./node_modules/playwright-bdd/package.json
