#!/bin/sh

MODULE_NAME=geoknow-generator-ui_1.0.1

echo "Building Debian package for ${MODULE_NAME}"
rm -rf ../target/debian

# add the Debian control files
cp -r debian ../target/

# build the package and sign it
cd ../target
debuild --check-dirname-level 0 -b
