#!/bin/sh

# Exit on any error
set -euo pipefail

npm run lint
npm run build
npm test
npm run examples
npx np --yolo --no-release-draft
