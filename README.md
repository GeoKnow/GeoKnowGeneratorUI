# GeoKnow Generator UI

The GeoKnow Generator provides workbench that integrates of tools developed within [GeoKnow project](http://geoknow.eu/), and are part of the [Linked Data Stack](http://stack.linkeddata.org/). These workbench aim to provide the required methods and tools to easly integrate and process geospatial data across a wide range of data sources on the web of data.

## Install

* __From Debian package__: The GeoKnow Generator UI is available as a debuian package, to install follow [these](http://stack.linkeddata.org/documentation/installation-of-a-local-generator-demonstrator/) instructions.

* __Form source__: You can use `maven pacakge` to package the souces in a war file and deploy it on a servlet container. 

These option will not install any integrated component from the stack and you require to install each one. You can choose to use again Debian packages following [these](http://stack.linkeddata.org/documentation/installation-of-a-local-generator-demonstrator/) instructions, or manually visiting each developer's component installation guides.

## Configuration

### Application configuration

1. Make a copy of the `src/main/resources/framework-configuration-template.ttl` to `src/main/resources/framework-configuration.ttl` and provide the ***REMOVED*** data.

2. Have a clean triple store and make sure to have a user create in the lds:StorageService, the lds:SecuredSPARQLEndPointService user will be automatically created

3. Make a copy of the `src/main/webapp/WEB-INF/web-template.xml` to `src/main/webapp/WEB-INF/web.xml` and provide the ***REMOVED*** data.


Note that the endpoint has to support [UPDATE](http://www.w3.org/TR/2013/REC-sparql11-update-20130321/) service and [Graph Store HTTP Protocol](http://www.w3.org/TR/2013/REC-sparql11-http-rdf-update-20130321/) 
	

## Optional Extra Configutation

Depending on the components you use in the Generator some extra configurations may be required.  

### Using Virtuoso Endpoint

If you have a Virtuoso Endpoint, you can configure the following: 

1. Enable SPARQL Update on a Virtuoso SPARQL by excecuting the following lines in the isql utility:

		$ isql-vt
		GRANT SPARQL_UPDATE TO "SPARQL"
		GRANT EXECUTE ON DB.DBA.L_O_LOOK TO "SPARQL"

2. [Enable CORS for Virtuoso](http://virtuoso.openlinksw.com/dataspace/dav/wiki/Main/VirtTipsAndTricksCORsEnableSPARQLURLs) SPARQL endpoint.

### Authentication configuration



### Using OntoWiki-Virtuoso

In order that [OntoWiki](https://github.com/AKSW/OntoWiki) is able to access Virtuoso store, besides the installation of the OntoWiki-Virtuoso component you need to follow the instructions of OntoWiku using [Virtuoso Backend](https://github.com/AKSW/OntoWiki/wiki/VirtuosoBackend).


## Issues

If some components are installed on the same tomcat server as the Generator, it is better to increase the Java Heap space. Edit the file /etc/default/tomcat7 and perform the following change.

	# The original options look something like this:
	# JAVA_OPTS="-Djava.awt.headless=true -Xmx128m -XX:+UseConcMarkSweepGC"

	JAVA_OPTS="-Djava.awt.headless=true -Xmx1g -XX:+UseConcMarkSweepGC"

## Licence

The source code of this repo is published under the Apache License Version 2.0

## Contact

http://geoknow.eu
