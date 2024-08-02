#!/bin/bash

# Exit on any error
set -euo pipefail

npm run docs:validate
npx publint
npm run knip
npm ci
npm run lint
npm run prettier
npm run tsc
npx npm test # 'npm run build' is called inside
npm run examples
SKIP_GIT_HOOKS=1 npx np --yolo --no-release-draft --any-branch
