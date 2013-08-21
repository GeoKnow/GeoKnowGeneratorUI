#!/bin/sh

MODULE_NAME=geoknow-generator-ui_0.1
echo "Building Debian package for ${MODULE_NAME}"
echo
rm -rf ../target/deb-pkg
mkdir -p ../target/deb-pkg

# copy target files to package workspace
cp -r ../public ../target/deb-pkg/
cp -r ../node_modules ../target/deb-pkg/
cp ../app.js ../target/deb-pkg/
cp ../favicon.ico ../target/deb-pkg/
cp ../package.json ../target/deb-pkg/

# Add the Debian control files
cp -r debian ../target/deb-pkg

# Build the package and sign it
cd ../target/deb-pkg
debuild --check-dirname-level 0 -b
