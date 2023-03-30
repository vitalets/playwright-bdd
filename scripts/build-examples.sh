#!/bin/sh

# Exit on any error
set -euo pipefail

# pack playwright-bdd for usage in examples
find . -name 'playwright-bdd-*.tgz' -exec rm -f {} \;
npm run build
npm pack
pushd examples
find .. -name 'playwright-bdd-*.tgz' -exec npm install {} \;
popd
find . -name 'playwright-bdd-*.tgz' -exec rm -f {} \;