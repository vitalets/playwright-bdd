#!/bin/bash

# Exit on any error
set -euo pipefail

npm run docs:validate
npx publint
npm run knip
npm ci
npm run lint
npm run prettier
npm run build # call before tsc to get 'node_modules/playwright-bdd'
npm run tsc
npx npm test
npm run examples
SKIP_GIT_HOOKS=1 npx np --yolo --no-release-draft --any-branch
