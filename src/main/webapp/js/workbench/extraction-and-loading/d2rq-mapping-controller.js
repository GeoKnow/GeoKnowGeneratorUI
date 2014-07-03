'use strict';

var D2RQMappingCtrl = function($scope, $http, $q, flash, ServerErrorResponse, AccountService, ConfigurationService, D2RQService, localize) {
    var services = ConfigurationService.getComponentServices(":D2RQ");
	var d2rqServiceUrl = services[0].serviceUrl;

    var supportedDatabases = ["MySQL", "PostgreSQL", "HSQL", "Oracle", "MicrosoftSQLServer"];

    //mapping groups

    $scope.mgroups = D2RQService.getAllMappingGroups();

    $scope.refreshMappingGroups = function() {
        return D2RQService.refreshMappingGroups().then(function(response) {
            $scope.mgroups = D2RQService.getAllMappingGroups();
        });
    };

    var adding = false;

    $scope.isAdding = function() {
        return adding;
    };

    $scope.databases = ConfigurationService.getAllDatabases();

    $scope.dbFilter = function(database) {
        return supportedDatabases.indexOf(database.dbType) > -1;
    };

    $scope.datasources = []; //data groups
    $scope.ontologies = [];

    $scope.updateConnection = function() {
        if ($scope.mgroup.database.dbType=="MySQL") {
            $scope.mgroup.connection = "jdbc:mysql://" + $scope.mgroup.database.dbUser + ":" + $scope.mgroup.database.dbPassword
                                            + "@" + $scope.mgroup.database.dbHost + ":" + $scope.mgroup.database.dbPort
                                            + "/" + $scope.mgroup.database.dbName;
        } else if ($scope.mgroup.database.dbType=="PostgreSQL") {
            $scope.mgroup.connection = "jdbc:postgresql://" + $scope.mgroup.database.dbUser + ":" + $scope.mgroup.database.dbPassword
                                            + "@" + $scope.mgroup.database.dbHost + ":" + $scope.mgroup.database.dbPort
                                            + "/" + $scope.mgroup.database.dbName;
        } else if ($scope.mgroup.database.dbType=="HSQL") {
            $scope.mgroup.connection = "jdbc:hsqldb:hsql://" + $scope.mgroup.database.dbUser + ":" + $scope.mgroup.database.dbPassword
                                            + "@" + $scope.mgroup.database.dbHost + ":" + $scope.mgroup.database.dbPort
                                            + "/" + $scope.mgroup.database.dbName;
        } else if ($scope.mgroup.database.dbType=="Oracle") {
            $scope.mgroup.connection = "jdbc:oracle:thin://" + $scope.mgroup.database.dbUser + ":" + $scope.mgroup.database.dbPassword
                                            + "@" + $scope.mgroup.database.dbHost + ":" + $scope.mgroup.database.dbPort
                                            + "/" + $scope.mgroup.database.dbName;
        } else if ($scope.mgroup.database.dbType=="MicrosoftSQLServer") {
            $scope.mgroup.connection = "jdbc:jtds:sqlserver://" + $scope.mgroup.database.dbUser + ":" + $scope.mgroup.database.dbPassword
                                            + "@" + $scope.mgroup.database.dbHost + ":" + $scope.mgroup.database.dbPort
                                            + ";" + $scope.mgroup.database.dbName;
        }
    };

    var readDatasources = function() {
        return $http.get(d2rqServiceUrl+"/data/groups/metadata/get")
            .then(function(response) {
                $scope.datasources = response.data;
            });
    };

    var emptyMappingGroup = {name:"", ontology:null, source:null, connection:"", database:null};

    $scope.mgroup = angular.copy(emptyMappingGroup);

    $scope.newMappingGroup = function() {
        $scope.mappingGroupForm.$setPristine();
        $scope.mgroup = angular.copy(emptyMappingGroup);
        $scope.ontologies = [];
        $scope.datasources = [];
        adding = false;
        $http.get(d2rqServiceUrl+"/ontologies/metadata/get")
            .then(function(response) {
                $scope.ontologies = response.data;
            });
        readDatasources();
    };

    var findDatasource = function(conn) {
        for (var ind in $scope.datasources) {
            var ds = $scope.datasources[ind];
            if (ds.dbConnection==conn)
                return ds;
        }
        return null;
    };

    var createDatasource = function() {
        var data = {name: $scope.mgroup.database.label
                    , connection: $scope.mgroup.connection
                    , tables: []
                    , user: AccountService.getUsername()}; //todo unauthorized user
        return $http({
            url: d2rqServiceUrl+"/data/groups/add",
            method: "POST",
            data: data,
            dataType: "json",
            headers: {"Content-Type":"application/json; charset=utf-8"}
        });
    };

    var findOrCreateDatasource = function(conn) {
        var ds = findDatasource(conn);
        if (ds==null) {
            return createDatasource().then(function(response) {
                return readDatasources().then(function(response) {
                    return findDatasource(conn);
                });
            });
        } else {
            var deferred = $q.defer();
            deferred.resolve(ds);
            return deferred.promise;
        }
    };

    $scope.addMappingGroup = function() {
        adding = true;
        findOrCreateDatasource($scope.mgroup.connection).then(function(ds) {
            $scope.mgroup.source = ds;
            var data = {name: $scope.mgroup.name
                        , ontology: $scope.mgroup.ontology.uri
                        , compositeData: $scope.mgroup.source.id
                        , user: AccountService.getUsername()}; //todo unauthorized user
            $http({
                url: d2rqServiceUrl+"/mappings/groups/add",
                method: "POST",
                data: data,
                dataType: "json",
                headers: {"Content-Type":"application/json; charset=utf-8"}
            }).then(function(response) {
                $scope.refreshMappingGroups().then(function(response) {
                    close('#modalMappingGroup');
                    adding = false;
                });
            }, function(response) {
                close('#modalMappingGroup');
                flash.error = ServerErrorResponse.getMessage(response.status);
            });
        });
    };

    $scope.deleteMappingGroup = function(id) {
        $http({
            url: d2rqServiceUrl+"/mappings/groups/" + id + "/delete",
            method: "POST",
            dataType: "json",
            headers: {"Content-Type":"application/json; charset=utf-8"}
        }).then(function(response) {
            $scope.refreshMappingGroups();
        }, function(response) {
            flash.error = ServerErrorResponse.getMessage(response.status);
            $scope.refreshMappingGroups();
        });
    };

    $scope.actualizeMappingGroup = function(id) {
        $http({
            url: d2rqServiceUrl+"/mappings/groups/" + id + "/actualize",
            method: "POST",
            data: {user: AccountService.getUsername()},
            dataType: "json",
            headers: {"Content-Type":"application/json; charset=utf-8"}
        }).then(function(response) {
            $scope.refreshMappingGroups();
        }, function(response) {
            flash.error = ServerErrorResponse.getMessage(response.status);
            $scope.refreshMappingGroups();
        });
    };

    //mappings

    $scope.modaltitle = "";

    $scope.datasource = null; //data source group object
    $scope.ontologyClasses = []; //array of objects

    $scope.patternTypes = [
        {value:'uriColumn', label:'_uri-column_'},
    	{value:'patternColumns', label:'_uri-pattern-columns_'},
    ];

    $scope.joinConditionTypes = [
        {value:'fk', label:'_foreign-key_'},
        {value:'linkingTable', label:'_linking-table_'},
    ];

    var table2columns = {}; //property - table name, value - columns list

    $scope.tables = [];

    $scope.tableColumns = []; // array of string

    var updatePropertiesColumns = function() {
        for (var ind in $scope.mapping.dataProperties) {
            var dp = $scope.mapping.dataProperties[ind];
            if ($scope.tableColumns.indexOf(dp.column)==-1) dp.column = null;
        }
        for (var ind in $scope.mapping.objectProperties) {
            var op = $scope.mapping.objectProperties[ind];
            if ($scope.tableColumns.indexOf(op.column)==-1) op.column = null;
            op.join.table1 = $scope.mapping.table;
            if ($scope.tableColumns.indexOf(op.join.table1column)==-1) op.join.table1column = null;
        }
    };

    $scope.updateColumns = function() {
        if ($scope.tableColumns[$scope.mapping.table] != undefined) {
            $scope.tableColumns = $scope.tableColumns[$scope.mapping.table];
            updatePropertiesColumns();
            return;
        }
        $http({
            url: d2rqServiceUrl+"/database/columns/get",
            method: "GET",
            params: {connection: $scope.datasource.dbConnection, table: $scope.mapping.table},
            dataType: "json",
            headers: {"Content-Type":"application/json; charset=utf-8"}
        }).then(function(response) {
            var result = response.data;
            var columns = []
            for (var ind in result) {
                columns.push(result[ind].column);
            }
            $scope.tableColumns = columns;
            $scope.tableColumns[$scope.mapping.table] = columns;
            updatePropertiesColumns();
        }, function(response) {
        //todo
        });
    };

    $scope.updateLinkingTable = function(property) {
        if ($scope.tableColumns[property.join.linkingTable] != undefined) {
            property.join.linkingTableStructure = $scope.tableColumns[property.join.linkingTable];
            if (property.join.linkingTableStructure.indexOf(property.join.linkingTableColumn1)==-1) property.join.linkingTableColumn1 = null;
            if (property.join.linkingTableStructure.indexOf(property.join.linkingTableColumn2)==-1) property.join.linkingTableColumn2 = null;
            return;
        }
        $http({
            url: d2rqServiceUrl+"/database/columns/get",
            method: "GET",
            params: {connection: $scope.datasource.dbConnection, table: property.join.linkingTable},
            dataType: "json",
            headers: {"Content-Type":"application/json; charset=utf-8"}
        }).then(function(response) {
            var result = response.data;
            var columns = [];
            for (var ind in result) {
                columns.push(result[ind].column);
            }
            $scope.tableColumns[$scope.mapping.table] = columns;
            property.join.linkingTableStructure = columns;
            if (property.join.linkingTableStructure.indexOf(property.join.linkingTableColumn1)==-1) property.join.linkingTableColumn1 = null;
            if (property.join.linkingTableStructure.indexOf(property.join.linkingTableColumn2)==-1) property.join.linkingTableColumn2 = null;
        }, function(response) {
        //todo
        });
    };

    $scope.updateRefTable = function(property) {
        property.join.table2 = property.ref.classMappingTable.table;
    };

    $scope.togglePatternColumn = function(column) {
        var index = $scope.mapping.patternColumns.indexOf(column);
        if (index > -1) { // is currently selected
            $scope.mapping.patternColumns.splice(index, 1);
        } else { // is newly selected
            $scope.mapping.patternColumns.push(column);
        }
    };

    $scope.objectPropMappingTypes = [
        {value:"column", label:"_uri-column_"},
        {value:"ref", label:"_mapping-ref_"}
    ];

    var emptyDataProperty = {id: 0
                             , property: null //ontology class property object
                             , column: null //column name (string)
    };
    var emptyJoinConditions = {type:"", table1:"", table2:"", linkingTable:"", table1column:"", table2column:"", linkingTableColumn1:"", linkingTableColumn2:""};
    var emptyObjectProperty = {id: 0
                                , property: null //ontology class property object
                                , mappingType:"" //string ($scope.objectPropMappingTypes)
                                , column: null //string
                                , ref:null //mapping object
                                , join:angular.copy(emptyJoinConditions)
    };
    var emptyMapping = {name:""
                        , group: null //mapping group object
                        , source: null //data source object
                        , class: null //ontology class object
                        , ptype:"" //pattern type ($scope.patternTypes)
                        , uriColumn:"" //column name (string)
                        , patternColumns:[] //array of column names (strings)
                        , dataProperties: []
                        , objectProperties: []
    };
    emptyMapping.dataProperties.push(angular.copy(emptyDataProperty));
    emptyMapping.objectProperties.push(angular.copy(emptyObjectProperty));

    $scope.mapping = angular.copy(emptyMapping);

    $scope.isNew = false;

    $scope.newMapping = function(mappingGroup) {
        $scope.modaltitle = "_new-mapping_";

        $scope.isNew = true;

        adding = false;

        $scope.mappingForm.$setPristine();
        $scope.mapping = angular.copy(emptyMapping);

        $scope.ontologyClasses = [];
        $scope.tables = [];
        $scope.tableColumns = [];

        $scope.mapping.group = mappingGroup;

        $http.get(d2rqServiceUrl+"/data/groups/" + mappingGroup.compositeData + "/metadata/get")
            .then(function(response) {
                $scope.datasource = response.data;

                //get tables
                $http({
                    url: d2rqServiceUrl+"/database/tables/get",
                    method: "GET",
                    params: {connection: $scope.datasource.dbConnection},
                    dataType: "json",
                    headers: {"Content-Type":"application/json; charset=utf-8"}
                }).then(function(response) {
                    var result = response.data;
                    $scope.tables = [];
                    for (var ind in result) {
                        $scope.tables.push(result[ind].table);
                    }
                });

                //get tables structure
                for (var ind in $scope.mapping.group.mappings) {
                    setTableStructure($scope.mapping.group.mappings[ind], $scope.datasource.dbConnection);
                }
            }, function(response) {
                $scope.datasource = {data:[]};
            });

        $http.get(d2rqServiceUrl+"/ontologies/" + mappingGroup.ontology + "/classes/mappingscheme/get")
            .then(function(response) {
                $scope.ontologyClasses = response.data;
            }, function(response) {
                //todo
            });
    };

    var setTableStructure = function(mapping, dbConnection) {
        $http({
            url: d2rqServiceUrl+"/database/columns/get",
            method: "GET",
            params: {connection: dbConnection, table: mapping.classMappingTable.table},
            dataType: "json",
            headers: {"Content-Type":"application/json; charset=utf-8"}
        }).then(function(response) {
            var result = response.data;
            mapping.dataStructure = [];
            for (var ci in result)
                mapping.dataStructure.push(result[ci].column);
        }, function(response) {
            mapping.dataStructure = [];
        });
    };

    $scope.editMapping = function(mapping, mappingGroup) {
        $scope.modaltitle = "_edit-mapping_";

        $scope.isNew = false;

        $scope.mappingForm.$setPristine();

        $scope.mapping = angular.copy(emptyMapping);

        $scope.mapping.id = mapping.id;
        $scope.mapping.name = mapping.name;
        $scope.mapping.group = mappingGroup;

        var dataRequest = $http.get(d2rqServiceUrl+"/data/groups/" + mappingGroup.compositeData + "/metadata/get")
            .then(function(response) {
                $scope.datasource = response.data;

                //get tables
                $http({
                    url: d2rqServiceUrl+"/database/tables/get",
                    method: "GET",
                    params: {connection: $scope.datasource.dbConnection},
                    dataType: "json",
                    headers: {"Content-Type":"application/json; charset=utf-8"}
                }).then(function(response) {
                    var result = response.data;
                    $scope.tables = [];
                    for (var ind in result) {
                        $scope.tables.push(result[ind].table);
                    }
                });

                //get table structure
                for (var ind in $scope.mapping.group.mappings) {
                    setTableStructure($scope.mapping.group.mappings[ind], $scope.datasource.dbConnection);
                }

                //set mapping data source
                for (var ind in $scope.datasource.data) {
                    if ($scope.datasource.data[ind].id==mapping.data) {
                        $scope.mapping.source = $scope.datasource.data[ind];
                        $scope.mapping.table = $scope.mapping.source.table;
                        $scope.updateColumns();
                        break;
                    }
                }
            }, function(response) {
                $scope.datasource = {data:[]};
            });

        var ontoRequest = $http.get(d2rqServiceUrl+"/ontologies/" + mappingGroup.ontology + "/classes/mappingscheme/get")
            .then(function(response) {
                $scope.ontologyClasses = response.data;
                //set mapping class
                for (var ind in $scope.ontologyClasses) {
                    if ($scope.ontologyClasses[ind].uri==mapping.classMappingTable.uri) {
                        $scope.mapping.class = $scope.ontologyClasses[ind];
                        break;
                    }
                }
                //data properties
                var id = 0;
                $scope.mapping.dataProperties = [];
                for (var ind in mapping.classMappingTable.dataProperties) {
                    var dp = mapping.classMappingTable.dataProperties[ind];
                    for (var pi in $scope.mapping.class.properties) {
                        if ($scope.mapping.class.properties[pi].uri == dp.uri) {
                            $scope.mapping.dataProperties.push({id: id, property: $scope.mapping.class.properties[pi], column: dp.tableColumn.second});
                            break;
                        }
                    }
                    id = id+1;
                }
                if ($scope.mapping.dataProperties.length==0) $scope.mapping.dataProperties.push(angular.copy(emptyDataProperty));
                //object properties
                id = 0;
                $scope.mapping.objectProperties = [];
                for (var ind in mapping.classMappingTable.objectProperties) {
                    var op = mapping.classMappingTable.objectProperties[ind];
                    var property = null;
                    for (var pi in $scope.mapping.class.properties) {
                        if ($scope.mapping.class.properties[pi].uri == op.uri) {
                            property = $scope.mapping.class.properties[pi];
                            break;
                        }
                    }
                    var ref = null;
                    if (op.refersMappingId!=null) {
                        for (var mi in $scope.mapping.group.mappings) {
                            if ($scope.mapping.group.mappings[mi].id==op.refersMappingId) {
                                ref = $scope.mapping.group.mappings[mi];
                                break;
                            }
                        }
                    }
                    var joinConditions = angular.copy(emptyJoinConditions);
                    joinConditions.table1 = mapping.classMappingTable.table;
                    joinConditions.table2 = ref==null ? null : ref.classMappingTable.table;
                    if (op.tableJoinConditions!=null) {
                        if (op.tableJoinConditions.length==1) {
                            joinConditions.type = "fk";
                            joinConditions.table1column = op.tableJoinConditions[0].columns[0].first;
                            joinConditions.table2column = op.tableJoinConditions[0].columns[0].second;
                        } else if (op.tableJoinConditions.length==2) {
                            joinConditions.type = "linkingTable";
                            if (op.tableJoinConditions[0].table1==joinConditions.table1) {
                                joinConditions.linkingTable = op.tableJoinConditions[0].table2;
                                joinConditions.table1column = op.tableJoinConditions[0].columns[0].first;
                                joinConditions.linkingTableColumn1 = op.tableJoinConditions[0].columns[0].second;
                                joinConditions.linkingTableColumn2 = op.tableJoinConditions[1].columns[0].first;
                                joinConditions.table2column = op.tableJoinConditions[1].columns[0].second;
                            } else if (op.tableJoinConditions[1].table1==joinConditions.table1) {
                                joinConditions.linkingTable = op.tableJoinConditions[1].table2;
                                joinConditions.table1column = op.tableJoinConditions[1].columns[0].first;
                                joinConditions.linkingTableColumn1 = op.tableJoinConditions[1].columns[0].second;
                                joinConditions.linkingTableColumn2 = op.tableJoinConditions[0].columns[0].first;
                                joinConditions.table2column = op.tableJoinConditions[0].columns[0].second;
                            }
                        }
                    }
                    var mappingObjectProp = {id: id, property: property, mappingType: op.uriColumn==null ? "ref" : "column",
                                                column: op.uriColumn==null ? null : op.uriColumn.second, ref: ref, join: joinConditions};
                    $scope.mapping.objectProperties.push(mappingObjectProp);
                    id = id+1;
                }
                if ($scope.mapping.objectProperties.length==0) {
                    $scope.mapping.objectProperties.push(angular.copy(emptyObjectProperty));
                    $scope.mapping.objectProperties[0].join.table1 = mapping.classMappingTable.table;
                }
            }, function(response) {
                //todo
            });

        $q.all([dataRequest, ontoRequest]).then(function(values) {
            for (var ind in $scope.mapping.objectProperties) {
                if ($scope.mapping.objectProperties[ind].join.type=="linkingTable") {
                    $scope.updateLinkingTable($scope.mapping.objectProperties[ind]);
                }
            }
        });

        $scope.mapping.ptype = mapping.classMappingTable.uriColumn==null ? "patternColumns" : "uriColumn";
        $scope.mapping.uriColumn = mapping.classMappingTable.uriColumn;
        $scope.mapping.patternColumns = mapping.classMappingTable.patternColumns==null ? [] : mapping.classMappingTable.patternColumns;
    };

    $scope.updateProperties = function() { //todo compare by uri
        var classProps = $scope.mapping.class.properties;
        for (var ind in $scope.mapping.dataProperties) {
            var dp = $scope.mapping.dataProperties[ind];
            if (classProps.indexOf(dp.property)==-1)
                dp.property = null;
        }
        for (var ind in $scope.mapping.objectProperties) {
            var op = $scope.mapping.objectProperties[ind];
            if (classProps.indexOf(op.property)==-1)
                op.property = null;
        }
    };

    $scope.isDataProperty = function(property) {
        return property.propertyType=="ANNOTATION_PROPERTY" || property.propertyType=="DATA_PROPERTY";
    };

    $scope.isObjectProperty = function(property) {
        return property.propertyType=="OBJECT_PROPERTY";
    };

    $scope.showAddDataProp = function(prop) {
        return prop.id===$scope.mapping.dataProperties[$scope.mapping.dataProperties.length-1].id;
    };

    $scope.showAddObjectProp = function(prop) {
        return prop.id===$scope.mapping.objectProperties[$scope.mapping.objectProperties.length-1].id;
    };

    $scope.addNewDataProperty = function() {
        var id = $scope.mapping.dataProperties[$scope.mapping.dataProperties.length-1].id+1;
        $scope.mapping.dataProperties.push({id: id, property: null, column: null});
    };

    $scope.addNewObjectProperty = function() {
        var id = $scope.mapping.objectProperties[$scope.mapping.objectProperties.length-1].id+1;
        $scope.mapping.objectProperties.push({id: id, property: null, mappingType:"", column: null, ref:null});
    };

    $scope.removeDataProperty = function(prop) {
        var index = $scope.mapping.dataProperties.indexOf(prop);
        $scope.mapping.dataProperties.splice(index, 1);
        if ($scope.mapping.dataProperties.length==0) $scope.mapping.dataProperties.push(angular.copy(emptyDataProperty));
    };

    $scope.removeObjectProperty = function(prop) {
        var index = $scope.mapping.objectProperties.indexOf(prop);
        $scope.mapping.objectProperties.splice(index, 1);
        if ($scope.mapping.objectProperties.length==0) {
            var emptyProp = angular.copy(emptyObjectProperty);
            emptyProp.join.table1 = $scope.mapping.table;
            $scope.mapping.objectProperties.push(emptyProp);
        }
    };

    var findData = function(table) {
        for (var ind in $scope.datasource.data) {
            var d = $scope.datasource.data[ind];
            if (d.table==table)
                return d;
        }
        return null;
    };

    var createData = function(table) {
        var data = {
            tables: [table],
            groupId: $scope.datasource.id,
            user: AccountService.getUsername()
        };
        return $http({
                url: d2rqServiceUrl+"/data/add",
                method: "POST",
                dataType: "json",
                data: data,
                headers: {"Content-Type":"application/json; charset=utf-8"}
            });
    };

    var findOrCreateData = function(table) {
        var d = findData(table);
        if (d==null) {
            return createData(table).then(function(response) {
                return $http.get(d2rqServiceUrl+"/data/groups/" + $scope.datasource.id + "/metadata/get").then(function(response) {
                    $scope.datasource = response.data;
                    return findData(table);
                });
            });
        } else {
            var deferred = $q.defer();
            deferred.resolve(d);
            return deferred.promise;
        }
    };

    $scope.save = function() {
        adding = true;
        var mappingTable = {
            table: $scope.mapping.table
            , uri: $scope.mapping.class.uri
            , patternColumns: null
            , uriColumn: null
            , dataProperties: []
            , objectProperties: []
            , blankNode: false
        };
        if ($scope.mapping.ptype=="uriColumn")
            mappingTable.uriColumn = $scope.mapping.uriColumn;
        else if ($scope.mapping.ptype=="patternColumns")
            mappingTable.patternColumns = $scope.mapping.patternColumns;
        for (var ind in $scope.mapping.dataProperties) {
            var dp = $scope.mapping.dataProperties[ind];
            if (dp.property!=null && dp.column!=null) {
                mappingTable.dataProperties.push({
                    uri: dp.property.uri,
                    tableColumn: {first: $scope.mapping.table, second: dp.column}
                });
            }
        }
        for (var ind in $scope.mapping.objectProperties) {
            var op = $scope.mapping.objectProperties[ind];
            if (op.property!=null) {
                if (op.mappingType=="column" && op.column!=null) {
                    mappingTable.objectProperties.push({
                        uri: op.property.uri
                        , uriColumn: {first: $scope.mapping.table, second: op.column}
                    });
                } else if (op.mappingType=="ref" && op.ref!=null) {
                    var p = {uri: op.property.uri
                                , refersMappingId: op.ref.id
                                , range: "http://www.w3.org/2002/07/owl#Thing" //range is not really used in d2rq mapping generation (in case of mapping reference) byt must be not null
                                , tableJoinConditions: []
                    };
                    if (op.join.table1column!=null && op.join.table1column!="" && op.join.table2column!=null && op.join.table2column!="") {
                        if (op.join.linkingTable==null || op.join.linkingTable=="") {
                            var joinCondRes = {table1:op.join.table1, table2:op.join.table2, columns:[{first:op.join.table1column, second:op.join.table2column}], type:"EQ"};
                            p.tableJoinConditions.push(joinCondRes);
                        } else {
                            if (op.join.linkingTableColumn1!=null && op.join.linkingTableColumn1!="" && op.join.linkingTableColumn2!=null && op.join.linkingTableColumn2!="") {
                                var joinCondRes1 = {table1:op.join.table1, table2:op.join.linkingTable, columns:[{first:op.join.table1column, second:op.join.linkingTableColumn1}], type:"EQ"};
                                var joinCondRes2 = {table1:op.join.linkingTable, table2:op.join.table2, columns:[{first:op.join.linkingTableColumn2, second:op.join.table2column}], type:"EQ"};
                                p.tableJoinConditions.push(joinCondRes1);
                                p.tableJoinConditions.push(joinCondRes2);
                            }
                        }
                    }
                    mappingTable.objectProperties.push(p);
                }
            }
        }

        if ($scope.isNew) {
            findOrCreateData(mappingTable.table).then(function(sd) {
                $scope.mapping.source = sd;
                var data = {
                    name: $scope.mapping.name
                    , mappingTable: mappingTable
                    , data: $scope.mapping.source.id
                    , user: AccountService.getUsername()
                    , compositeMapping: $scope.mapping.group.id
                };

                $http({
                    url: d2rqServiceUrl+"/mappings/add",
                    method: "POST",
                    dataType: "json",
                    data: data,
                    headers: {"Content-Type":"application/json; charset=utf-8"}
                }).then(function(response) {
                    $scope.refreshMappingGroups().then(function(response) {
                        close('#modalMapping');
                        adding = false;
                    });
                }, function(response) {
                    close('#modalMapping');
                    flash.error = ServerErrorResponse.getMessage(response.status);
                });
            });
        } else {
            $http({
                url: d2rqServiceUrl+"/mappings/" + $scope.mapping.id + "/update",
                method: "POST",
                dataType: "json",
                data: {name: $scope.mapping.name, mappingTable: mappingTable},
                headers: {"Content-Type":"application/json; charset=utf-8"}
            }).then(function(response) {
                $scope.refreshMappingGroups().then(function(response) {
                    close('#modalMapping');
                    adding = false;
                });
            }, function(response) {
                close('#modalMapping');
                flash.error = ServerErrorResponse.getMessage(response.status);
            });
        }
    };

    $scope.deleteMapping = function(id) {
        $http.post(d2rqServiceUrl+"/mappings/" + id + "/delete")
            .then(function(response) {
                $scope.refreshMappingGroups();
            }, function(response) {
                flash.error = ServerErrorResponse.getMessage(response.status);
                $scope.refreshMappingGroups();
            });
    };

    $scope.notCurrent = function(mapping) {
        return $scope.isNew || mapping.id != $scope.mapping.id;
    };

    $scope.localize = function(str) {
        return localize.getLocalizedString(str);
    };
};
