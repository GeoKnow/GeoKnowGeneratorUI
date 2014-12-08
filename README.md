# GeoKnow Generator UI

The GeoKnow Generator provides workbench that integrates of tools developed within [GeoKnow project](http://geoknow.eu/), and are part of the [Linked Data Stack](http://stack.linkeddata.org/). These workbench aim to provide the required methods and tools to easly integrate and process geospatial data across a wide range of data sources on the web of data. 

### Requirements

* [Virtuoso 7.1](https://github.com/openlink/virtuoso-opensource) triple store is required for most of the GeoKnow software tools integrated in this Workbench. 
* [Spring-batch-admin-generatror](https://github.com/GeoKnow/spring-batch-admin). For the moment this is required only for LIMES-Service in order to perform batch jobs, but it is planned to migrate some other coponents to be executed using this tool. 


## Install

* __From Debian package__: The GeoKnow Generator UI is available as a debuian package, to install follow [these](http://stack.linkeddata.org/documentation/installation-of-a-local-generator-demonstrator/) instructions. This is a preconfigured application that assumes that a triple store is installed in the localhost.
* __Form source__: Follow the configuration instructions below, and use `maven pacakge` to package the souces in a war file and deploy it on a servlet container. 

The Generator Workbencg will not install any integrated component from the stack and you require to install each one. You can choose to use again Debian packages following [these](http://stack.linkeddata.org/documentation/installation-of-a-local-generator-demonstrator/) instructions, or following instructions from each developer's component installation guides.

## Configuration

### Application configuration

1. Open the `src/main/resources/framework-configuration-template.ttl` and provide for:
	
	* GeoKnowGenerator foaf:homepage URL if the application is going to be accessed from a different place than the localhost, 
	* VirtuosoConductor lds:serviceUrl, lds:user, lds:password and lds:connectionString,
	* VirtuosoAuthSPARQLEndpoint void:sparqlEndpoint, lds:serviceUrl, and desired user/password for the workbench user, wich will be created at setup.
	* VirtuosoEndpoint : void:sparqlEndpoint and lds:serviceUrl, 
	* Admin foaf:mbox, which will belong to tha initial administrator user account. By default a admin user with password is created, and an email has to be provided in the configuration. 

2. Open the `src/main/resources/framework-components.ttl` and make sure URLs for alll stack components are accurate.

3. In order to let other users to register into the system, you need to edit `src/main/webapp/WEB-INF/web.xml` and provide the ***REMOVED*** data that is required for email notifications.
		
### Application Setup and Reset

To initalize the application the user is only required to navigate to the URL where the application has being deployed and a setup page will be shown. 

The application requires a system file at `/etc/generator/` (configured in the web.xml file), with write privileges for creating a init file that will be used as a flag for setting the system up.

The Setup process will create a system user in Virtuoso and the admininstrator user proviced in the configuration file. It will also create and add required information on the system graphs. 

To reset the application for taking into account a new configuration, you need to delete the  file created in `/etc/generator/init.txt`, and navigate to the workbench url where the setup page will be shown. Make sure to select the reset checkbox in order to delete previous data.

### Virtuoso Endpoint

Currently ontly Virtuoso store is supported and it has being tested in version 7.1. The Generator makes use of Virtuoso users management to allow the creation of private graphs and allow them to grant access to to specific users. 

## Extra Configutation

Depending on the components you use in the Generator some extra configurations may be required.  

## Issues

### Tomcat
If some components are installed on the same tomcat server as the Generator, it is better to increase the Java Heap space. Edit the file /etc/default/tomcat7 and perform the following change.

	# The original options look something like this:
	# JAVA_OPTS="-Djava.awt.headless=true -Xmx128m -XX:+UseConcMarkSweepGC"

	JAVA_OPTS="-Djava.awt.headless=true -Xmx1g -XX:+UseConcMarkSweepGC"

### Using OntoWiki-Virtuoso

In order that [OntoWiki](https://github.com/AKSW/OntoWiki) is able to access Virtuoso store, besides the installation of the OntoWiki-Virtuoso component you need to follow the instructions of OntoWiku using [Virtuoso Backend](https://github.com/AKSW/OntoWiki/wiki/VirtuosoBackend).

## Licence

The source code of this repo is published under the Apache License Version 2.0

## Contact

http://geoknow.eu
