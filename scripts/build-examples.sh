#!/bin/sh

# Exit on any error
set -euo pipefail

# pack playwright-bdd for usage in examples

npm run build
npm pack
find . -name 'playwright-bdd-*.tgz' -exec mv -f {} examples/playwright-bdd.tgz \;
pushd examples
npm install
popd
