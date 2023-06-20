#!/bin/bash

# Exit on any error
set -euo pipefail

npx publint
npm run lint
npm run prettier
npx cross-env FORBID_ONLY=1 npm test
npm run examples:b # 'npm run build' is called inside examples:b
npm run examples
npx np --yolo --no-release-draft --no-tests --any-branch
