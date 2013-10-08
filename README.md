# GeoKnow Generator UI

A web application for the GeoKnow Generator Workbench

TODO: complete this 

## Install

Copy src/main/webapp contents to a server of your choice

## Configuration

### Using Virtuoso server

Enable SPARQL Update on a Virtuoso SPARQL endpoint:

	$ isql-vt
		GRANT SPARQL_UPDATE TO "SPARQL"
		GRANT EXECUTE ON DB.DBA.L_O_LOOK TO "SPARQL"

CORS enable a Virtuoso SPARQL endpoint:
http://virtuoso.openlinksw.com/dataspace/dav/wiki/Main/VirtTipsAndTricksCORsEnableSPARQLURLs

## Licence

The source code of this repo is published under the Apache License Version 2.0

## Contact

http://geoknow.eu
