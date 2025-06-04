#!/bin/bash

# Exit on any error
set -euo pipefail

rm -rf ./dist
npx tsc -p tsconfig.build.json

# copy 'dist' to 'node_modules/playwright-bdd' to allow import from 'playwright-bdd' in tests
# note: if copied to 'test/node_modules/playwright-bdd', 
# TS finds playwright-bdd typings in 'examples/node_modules/playwright-bdd' 
# instead of 'test/node_modules/playwright-bdd'. 
# If types change, TS may show type errors in tests until examples re-build (it's unconvenient).

# Currently there is another problem: after 'npm install <module>', node_modules/playwright-bdd is removed
# and 'npm run tsc' does not pass. To fix it, we should run `npm run build`.
rm -rf ./node_modules/playwright-bdd
mkdir -p ./node_modules/playwright-bdd
cp -R ./dist ./node_modules/playwright-bdd/
cp ./package.json ./node_modules/playwright-bdd/package.json
