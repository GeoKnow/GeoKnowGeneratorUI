# GeoKnow Generator UI

The GeoKnow Generator provides workbench that integrates of tools developed within [GeoKnow project](http://geoknow.eu/), and are part of the [Linked Data Stack](http://stack.linkeddata.org/). These workbench aim to provide the required methods and tools to easly integrate and process geospatial data across a wide range of data sources on the web of data. 

## Install

* __From Debian package__: The GeoKnow Generator UI is available as a debuian package, to install follow [these](http://stack.linkeddata.org/documentation/installation-of-a-local-generator-demonstrator/) instructions. This is a preconfigured application that assumes that a triple store is installed in the localhost.
* __Form source__: Follow the configuration instructiobs below, and use `maven pacakge` to package the souces in a war file and deploy it on a servlet container. 

These option will not install any integrated component from the stack and you require to install each one. You can choose to use again Debian packages following [these](http://stack.linkeddata.org/documentation/installation-of-a-local-generator-demonstrator/) instructions, or manually visiting each developer's component installation guides.

## Configuration

### Requirements

* Virtuoso 7.1 triple store and make sure to have a superuser created.

### Application configuration

1. Open the `src/main/resources/framework-configuration.ttl` and provide endpoints, users and password information in the lds:StorageService element. The  lds:SecuredSPARQLEndPointService user will be automatically created in the setup.

2. Open the `src/main/resources/framework-components.ttl` and make sure URLs for alll stack components are accurate.

2. Edit `src/main/webapp/WEB-INF/web.xml` and provide the ***REMOVED*** data.


Note that the endpoint has to support [UPDATE](http://www.w3.org/TR/2013/REC-sparql11-update-20130321/) service and [Graph Store HTTP Protocol](http://www.w3.org/TR/2013/REC-sparql11-http-rdf-update-20130321/) 
	
### Application setup

To initalize the application the user is only required to navigate to the URL where the application has being deployed and a setup page will be shown. The application requires a system file (e.g. `/etc/generator/`) with write privileges for creating a init file that will be used as a flag for setting the system up.

### Virtuoso Endpoint

Currently ontly Virtuoso store is supported and it has being tested in version 7.1. The Generator makes use of Virtuoso users management to allow the creation of private graphs and allow them to grant access to to specific users. 

## Optional Extra Configutation

Depending on the components you use in the Generator some extra configurations may be required.  


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
