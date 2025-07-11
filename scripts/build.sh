#!/bin/bash

# Exit on any error
set -euo pipefail

rm -rf ./dist
npx tsc -p tsconfig.build.json

# copy 'dist' to 'test/node_modules/playwright-bdd' to allow import from 'playwright-bdd' in tests

# Note: if copied to 'test/node_modules/playwright-bdd', 
# TS finds playwright-bdd typings in 'examples/node_modules/playwright-bdd' 
# instead of 'test/node_modules/playwright-bdd'. 
# If types change, TS may show type errors in tests until examples re-build (it's unconvenient).

# But if copying to root 'node_modules/playwright-bdd', there is another problem: 
# after 'npm install <module>', node_modules/playwright-bdd is removed
# and 'npm run tsc' does not pass. To fix it, we should run `npm run build`.
# It's annoying b/c every time I swtich PW version, I need to run `npm run build`.

rm -rf ./test/node_modules/playwright-bdd
mkdir -p ./test/node_modules/playwright-bdd
cp -R ./dist ./test/node_modules/playwright-bdd/
cp ./package.json ./test/node_modules/playwright-bdd/