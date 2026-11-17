#!/bin/bash

# Exit on any error
set -euo pipefail

rm -rf ./dist
npx tsc -p tsconfig.build.json

# Copy the built package into parent node_modules directories for tests and skill evaluations.

# Note: if copied to 'test/node_modules/playwright-bdd', 
# TS finds playwright-bdd typings in 'examples/node_modules/playwright-bdd' 
# instead of 'test/node_modules/playwright-bdd'. 
# If types change, TS may show type errors in tests until examples re-build (it's unconvenient).

# But if copying to root 'node_modules/playwright-bdd', there is another problem: 
# after 'npm install <module>', node_modules/playwright-bdd is removed
# and 'npm run tsc' does not pass. To fix it, we should run `npm run build`.
# It's annoying b/c every time I swtich PW version, I need to run `npm run build`.

# Tests
rm -rf ./test/node_modules/playwright-bdd
mkdir -p ./test/node_modules/playwright-bdd
cp -R ./dist ./test/node_modules/playwright-bdd/
cp ./package.json ./test/node_modules/playwright-bdd/

# Skill evaluations
rm -rf ./skill-evals/node_modules/playwright-bdd
mkdir -p ./skill-evals/node_modules/playwright-bdd
cp -R ./dist ./skill-evals/node_modules/playwright-bdd/
cp ./package.json ./skill-evals/node_modules/playwright-bdd/

# Skill evaluations: npx bddgen
mkdir -p ./skill-evals/node_modules/.bin
chmod +x ./skill-evals/node_modules/playwright-bdd/dist/cli/index.js
ln -sfn ../playwright-bdd/dist/cli/index.js ./skill-evals/node_modules/.bin/bddgen
