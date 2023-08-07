#!/bin/bash

# Exit on any error
set -euo pipefail

npx publint
npm run knip
npm ci
npm run lint
npm run prettier
npx cross-env FORBID_ONLY=1 npm test # 'npm run build' is called inside
npm run examples
SKIP_PRE_PUSH=1 npx np --yolo --no-release-draft --no-tests --any-branch
