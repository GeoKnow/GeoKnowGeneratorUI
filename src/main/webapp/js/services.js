'use strict';

var module = angular.module('app.services', []);


module.factory('DateService', function(){
  var DateService = {
    getCurrentDate : function(){
      var now = new Date();
      //"YYYY-MM-DDThh:mm:ss"^^xsd:date;
      var month = now.getMonth() + 1; // getMonth returns values from 0 to 11
      var s_now = now.getFullYear() + "-" 
              + (month.toString().length==1 ? "0"+ month : month) + "-"
              + (now.getDate().toString().length==1 ? "0"+now.getDate() : now.getDate())
              + "T" + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
      return s_now;
    },

    formatDateTimeXsd : function(date) {
      //"YYYY-MM-DDThh:mm:ss"^^xsd:dateTime;
      var month = date.getMonth() + 1; // getMonth returns values from 0 to 11
      var s_date = date.getFullYear() + "-"
              + (month.toString().length==1 ? "0"+ month : month) + "-"
              + (date.getDate().toString().length==1 ? "0"+date.getDate() : date.getDate())
              + "T" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      return s_date;
    },

    formatDateXsd : function(date) {
      //"YYYY-MM-DD"^^xsd:date;
      var month = date.getMonth() + 1; // getMonth returns values from 0 to 11
      var s_date = date.getFullYear() + "-"
              + (month.toString().length==1 ? "0"+ month : month) + "-"
              + (date.getDate().toString().length==1 ? "0"+date.getDate() : date.getDate());
      return s_date;
    }
  }
  return DateService;
});

module.factory('ServerErrorResponse', function() {

  var ServerErrorResponseService = {

   getMessage: function(status){
   
    var statusText = '';
      switch (status) {
      case 400:
        statusText = 'Bad Request';
        break;
      case 401:
        statusText = 'Unauthorized';
        break;
      case 403:
        statusText = 'Forbidden';
        break;
      case 404:
        statusText = 'Not Found ';
        break;
      case 500:
        statusText = 'Internal Server Error';
        break;
      default:
        statusText = 'An error occurred:'+status;
      };
      return statusText;
    }
  };
  return ServerErrorResponseService;
});

module.factory('ConfigurationService', function(Config, AccountService) {
  var accessModes = {
        ":No" : "No",
        "acl:Read" : "Read" ,
        "acl:Write" : "Write"
  };

  var getNoAccessMode = function() {
    return":No";
  };

  var SettingsService = {
    getNoAccessMode: getNoAccessMode,

    setSPARQLEndpoint: function(endpoint) {
      Config.setEndpoint(endpoint);
    },

    getSPARQLEndpoint: function() {
      return Config.getEndpoint();
    },

    getPublicSPARQLEndpoint: function() {
        return Config.getPublicEndpoint();
    },

    setUriBase: function(uri) {
      Config.setNS(uri);
    },

    getUriBase: function() {
      return Config.getNS();
    },

    getSettingsGraph: function() {
      return Config.getGraph();
    },

    setSettingsGraph: function(uri) {
        Config.setGraph(uri);
    },

    restoreDefaultSettingsGraph: function() {
        Config.restoreDefault();
    },

    deleteResource: function(uri){
      var settings = Config.getSettings();
      delete settings[uri];
      Config.write();
      return true;
    },

    getResourcesType : function(type){
      var results = [];
      var elements = Config.select("rdf:type", type);
      for (var resource in elements)
      {
        var element = elements[resource];
        results.push(this.elementToJson(resource, element));
      }
      return results; 
    },
    

    getIdentifiers: function(){
      Config.read(); //update the list of identifiers
      return Object.keys(Config.getSettings());
    },

    getDatabaseTypes: function(){
      var results = [];
      var elements = Config.select("rdf:type", "gkg:DatabaseType");
      for (var resource in elements)
      {
        var element = elements[resource];
        results.push(
        {
          uri      : resource
        , label    : element["rdfs:label"][0]
        });
      }
      return results;
    },

    // TODO: improve the function the will replace all the json object building
    // but this may be easier to do on the config.js since there we know the propertyTypes
    elementToJson: function(resource, element){
      //create the json string
      var jsonStr = '{ "uri" : "' + resource + '", '; 
      if(typeof element == "object"){ // do not consider arrays
        for (var prop in element)
          if (element[prop].length == 1)
            jsonStr += ' "' + prop.substring(prop.indexOf(':')+1, prop.length) + '" : "' + element[prop][0] + '",';
          //else make recursive
      }
      jsonStr += '}';
      // convert the json string into a object
      var results = eval ("(" + jsonStr + ")");
      return results;
    },

    /**
    * Data Sources Endpoint functions
    */
    getAllEndpoints: function(){
      var results = [];
      var elements = Config.select("rdf:type", "gkg:SPARQLEndpoint");

      for (var resource in elements)
      {
        var element = elements[resource];
        results.push(
        {
          uri      : resource
        , label    : element["rdfs:label"][0]
        , endpoint : element["void:sparqlEndpoint"][0]
        , homepage : element["foaf:homepage"][0]
        });
      }
      return results;
    },

    getEndpoint: function(uri){
      var settings = Config.getSettings();
      var results = {
          uri      : uri
        , label    : settings[uri]["rdfs:label"][0]
        , endpoint : settings[uri]["void:sparqlEndpoint"][0]
        , homepage : settings[uri]["foaf:homepage"][0]
      };
      return results;  
    },

    addEndpoint: function(endpoint){
      var settings = Config.getSettings();
      settings[endpoint.uri] = { 
                    "rdfs:label" : [endpoint.label]
                  , "foaf:homepage" : [endpoint.homepage]
                  , "rdf:type": ["void:Dataset", "gkg:SPARQLEndpoint", "gkg:DataSource"] 
                  , "void:sparqlEndpoint" : [endpoint.endpoint]
                };
      Config.write();
      return true;
    },

    updateEndpoint: function(pEndpoint){
      var endpoint = Config.getSettings()[pEndpoint.uri];
      endpoint["rdfs:label"][0] = pEndpoint.label;
      endpoint["void:sparqlEndpoint"][0] = pEndpoint.endpoint;
      endpoint["foaf:homepage"][0] = pEndpoint.homepage;
      Config.write();
      return true;
    },

    /**
    * Data Sources Database functions
    */
    getAllDatabases: function(){
      var results = [];
      var elements = Config.select("rdf:type", "gkg:Database");
      for (var resource in elements)
      {
        var element = elements[resource];
        // var typeLabel = Config.getSettings()[element["gkg:dbType"][0]]["rdfs:label"];
        var type = Config.getSettings()[element["gkg:dbType"][0]];
        
        if(type != undefined)
          type = type["rdfs:label"][0];
        results.push(
        {
          uri  : resource
        , label       : element["rdfs:label"][0]
        , dbHost      : element["gkg:dbHost"][0]
        , dbName      : element["gkg:dbName"][0]
        , dbUser      : element["gkg:dbUser"][0]
        , dbPort      : element["gkg:dbPort"][0]
        , dbType      : type
        , dbPassword  : element["gkg:dbPassword"][0]
        });
      }
      return results;     
    },

    getDatabase: function(uri){
      var settings = Config.getSettings();
      var results = {
          uri        : uri
        , label      : settings[uri]["rdfs:label"][0]
        , dbHost     : settings[uri]["gkg:dbHost"][0]
        , dbName     : settings[uri]["gkg:dbName"][0]
        , dbPort     : settings[uri]["gkg:dbPort"][0]
        , dbType     : settings[uri]["gkg:dbType"][0]
        , dbUser     : settings[uri]["gkg:dbUser"][0]
        , dbPassword : settings[uri]["gkg:dbPassword"][0]
      };
      return results; 
    },

    addDatabase: function(database){
      var settings = Config.getSettings();
      settings[database.uri] = { 
                    "rdfs:label"     : [database.label]
                  , "gkg:dbHost"     : [database.dbHost]
                  , "rdf:type"       : ["void:Dataset", "gkg:Database", "gkg:DataSource"] 
                  , "gkg:dbPort"     : [database.dbPort]
                  , "gkg:dbName"     : [database.dbName]
                  , "gkg:dbType"     : [database.dbType]
                  , "gkg:dbUser"     : [database.dbUser]
                  , "gkg:dbPassword" : [database.dbPassword]
                };
      Config.write();
      return true;
    },

    updateDatabase: function(pDatabase){
      var database = Config.getSettings()[pDatabase.uri];
      database["rdfs:label"][0]      = pDatabase.label;
      database["gkg:dbHost"][0]      = pDatabase.dbHost;
      database["gkg:dbType"][0]      = pDatabase.dbType;
      database["gkg:dbPort"][0]      = pDatabase.dbPort;
      database["gkg:dbName"][0]      = pDatabase.dbName;
      database["gkg:dbUser"][0]      = pDatabase.dbUser;
      database["gkg:dbPassword"][0]  = pDatabase.dbPassword;
      Config.write();
      return true;
    },

    /**
    * NAMESPACES functions
    */
    getAllNamespaces: function(){

    },

    addNamespace: function(){

    },

    deleteNamespace: function(){

    },

    updateNamespace: function(){

    },

    /**
    * COMPONENTS functions
    */
    // TODO: @Alejandra add categories to the ontology and get them with the config service
    getComponentCategories: function() {
      return { categories:
        [ { name: "Extraction and Loading", id:"extraction-and-loading" },
          { name: "Querying and Exploration", id:"querying-and-exploration" },
          { name: "Authoring", id:"authoring" },
          { name: "Linking", id:"linking" },
          { name: "Enriching and Data Cleaning", id:"enriching-and-cleaning" }]
      };
    },

    getComponent : function(uri){
      var component = Config.getSettings()[uri];
      var results = this.elementToJson(uri, component);
      return results; 
    },

    getComponentServices : function(uri, serviceType){
      var settings = Config.getSettings();
      var elements = settings[uri]["lds:providesService"];
      
      var results = [];
      for (var resource in elements)
      {
        var element = elements[resource];

        // TODO: get a new version of config.js to provide also blanc nodes as URIS
        // if element is an string is an URI, otherwise is a nested node (blanc)
        if( typeof element == "string"){
          element = settings[element];
        }

        if (typeof serviceType != "undefined" && element["rdf:type"].indexOf(serviceType) === -1)
          continue; // not of the required type
        
        results.push(this.elementToJson(resource, element));
      }
      return results; 
    },

  	getAllComponents: function() {
  		var results = [];
      var elements = Config.select("rdf:type", "lds:StackComponent");
  		for (var resource in elements)
  		{
  			var element = elements[resource];
        results.push(this.elementToJson(resource, element));
  		}
		  return results;     
    },

    /**
    * Named Graphs functions
    */
    getAccessModes: function() {
        return accessModes;
    },

    getAllNamedGraphs: function() {
      var results = [];
  		var elements = Config.select("rdf:type", "sd:NamedGraph");
  		for (var resource in elements)
  		{
  			var namedGraph = elements[resource];
   			var res = {
  			    name  : namedGraph["sd:name"][0] // name is the URI
                , graph : {
                    label : namedGraph["sd:graph"][0]["rdfs:label"][0]
                    , description : namedGraph["sd:graph"][0]["dcterms:description"][0]
                    , modified : namedGraph["sd:graph"][0]["dcterms:modified"][0]
                    , created : namedGraph["sd:graph"][0]["dcterms:created"][0]
                    , endpoint : namedGraph["sd:graph"][0]["void:sparqlEndpoint"][0]
                }
                , publicAccess : getNoAccessMode()
                , usersWrite: []
                , usersRead: []
            };
            var access = namedGraph["gkg:access"];
            if (access != undefined) {
                for (var acc in access) {
                    var agentClass = access[acc]["acl:agentClass"];
                    var accessMode = access[acc]["acl:mode"][0];
                    if (agentClass != undefined && agentClass[0] == "foaf:Agent") { //public access
                        if (res.publicAccess==getNoAccessMode() || res.publicAccess=="acl:Read" && accessMode=="acl:Write")
                            res.publicAccess = accessMode;
                    } else { //user access
                        if (accessMode == "acl:Write") { res.usersWrite.push(access[acc]["acl:agent"][0]); }
                        else { res.usersRead.push(access[acc]["acl:agent"][0]); }
                    }
                }
            }
            results.push(res);
  		}
  		return results;      
    },

    getNamedGraph: function(name) {
      var settings = Config.getSettings();
      var results = {
          name  : settings[name]["sd:name"][0] // name is the URI
          , graph : { 
              label : settings[name]["sd:graph"][0]["rdfs:label"][0] 
            , description : settings[name]["sd:graph"][0]["dcterms:description"][0]
            , modified : settings[name]["sd:graph"][0]["dcterms:modified"][0]
            , created : settings[name]["sd:graph"][0]["dcterms:created"][0]
            , endpoint : settings[name]["sd:graph"][0]["void:sparqlEndpoint"][0]
          }
          , publicAccess : getNoAccessMode()
          , usersWrite: []
          , usersRead: []};

      var access = settings[name]["gkg:access"];
      if (access != undefined) {
            for (var acc in access) {
                var agentClass = access[acc]["acl:agentClass"];
                var accessMode = access[acc]["acl:mode"][0];
                if (agentClass != undefined && agentClass[0] == "foaf:Agent") {
                    results.publicAccess = accessMode;
                } else {
                    if (accessMode == "acl:Write") { results.usersWrite.push(access[acc]["acl:agent"][0]); }
                    else { results.usersRead.push(access[acc]["acl:agent"][0]); }
                }
            }
      }

      return results;
    },

    // add a named graph in the store
    addGraph: function(namedGraph) {
      // create the metadata for the graph

      var graph = { "rdf:type" : ["sd:NamedGraph"]
                  ,  "sd:name" : [namedGraph.name]
                  ,  "sd:graph" : [{ "rdfs:label" : [namedGraph.graph.label]
                                     , "rdf:type": ["void:Dataset", "sd:Graph"] 
                                     , "dcterms:description" : [namedGraph.graph.description]
                                     , "dcterms:modified" : [namedGraph.graph.modified]
                                     , "dcterms:created" : [namedGraph.graph.created]
                                     , "void:sparqlEndpoint" : [namedGraph.graph.endpoint]
                                  }] };
      var permissions = [];
      if (AccountService.isLogged()) {
          if (namedGraph.publicAccess=="acl:Read") {
            graph["gkg:access"] = [{ "acl:mode" : ["acl:Read"], "acl:agentClass" : ["foaf:Agent"] }];
            permissions.push({username: null, permissions: "r"});
          } else if (namedGraph.publicAccess=="acl:Write") {
            graph["gkg:access"] = [{ "acl:mode" : ["acl:Write"], "acl:agentClass" : ["foaf:Agent"] }];
            permissions.push({username: null, permissions: "w"});
          } else if (namedGraph.publicAccess==getNoAccessMode()) {
            permissions.push({username: null, permissions: "n"});
          }
          for (var user in namedGraph.usersRead) {
            if (namedGraph.usersWrite.indexOf(namedGraph.usersRead[user])==-1) {
                if (graph["gkg:access"]==undefined) { graph["gkg:access"] = []; }
                graph["gkg:access"].push({ "acl:mode" : ["acl:Read"], "acl:agent" : [namedGraph.usersRead[user]] });
                permissions.push({username: namedGraph.usersRead[user], permissions: "r"});
            }
          }
          for (var user in namedGraph.usersWrite) {
            if (graph["gkg:access"]==undefined) { graph["gkg:access"] = []; }
            graph["gkg:access"].push({ "acl:mode" : ["acl:Write"], "acl:agent" : [namedGraph.usersWrite[user]] });
            permissions.push({username: namedGraph.usersWrite[user], permissions: "w"});
          }
          graph["acl:owner"] = [AccountService.getAccountURI()];
      } else { // unauthorized user can create only public writable graphs
          graph["gkg:access"] = [{ "acl:mode" : ["acl:Write"], "acl:agentClass" : ["foaf:Agent"] }];
      }
      // create the graph
      Config.createGraph(Config.getNS()+namedGraph.name.replace(':',''), JSON.stringify(permissions));
      // if the creation succeed, then add the metadata
      // insert the metadata of the graph
      var settings = Config.getSettings();
      settings[namedGraph.name] = graph;
      settings[":default-dataset"]["sd:namedGraph"].push(namedGraph.name);
      Config.write();
      return true;
    },

    // saves a named graph in the store
    updateGraph: function(namedGraph) {
      var graph = Config.getSettings()[namedGraph.name];
      graph["sd:graph"][0]["rdfs:label"][0] = namedGraph.graph.label;
      graph["sd:graph"][0]["dcterms:description"][0]= namedGraph.graph.description;
      graph["sd:graph"][0]["dcterms:modified"][0] = namedGraph.graph.modified;
      graph["sd:graph"][0]["dcterms:created"][0] = namedGraph.graph.created;
      graph["sd:graph"][0]["void:sparqlEndpoint"][0] = namedGraph.graph.endpoint;
      var permissions = null;
      if (AccountService.isLogged()) {
          if (namedGraph.publicAccess=="acl:Read") {
            graph["gkg:access"] = [{ "acl:mode" : ["acl:Read"], "acl:agentClass" : ["foaf:Agent"] }];
            permissions = [{username : null, permissions : "r"}];
          } else if (namedGraph.publicAccess=="acl:Write") {
            graph["gkg:access"] = [{ "acl:mode" : ["acl:Write"], "acl:agentClass" : ["foaf:Agent"] }];
            permissions = [{username : null, permissions : "w"}];
          } else if (namedGraph.publicAccess==getNoAccessMode()) {
            graph["gkg:access"] = undefined;
            permissions = [{username : null, permissions : "n"}];
          }
          for (var user in namedGraph.usersRead) {
            if (namedGraph.usersWrite.indexOf(namedGraph.usersRead[user])==-1) {
                if (graph["gkg:access"]==undefined) { graph["gkg:access"] = []; }
                graph["gkg:access"].push({ "acl:mode" : ["acl:Read"], "acl:agent" : [namedGraph.usersRead[user]] });
                permissions.push({username: namedGraph.usersRead[user], permissions: "r"});
            }
          }
          for (var user in namedGraph.usersWrite) {
            if (graph["gkg:access"]==undefined) { graph["gkg:access"] = []; }
            graph["gkg:access"].push({ "acl:mode" : ["acl:Write"], "acl:agent" : [namedGraph.usersWrite[user]] });
            permissions.push({username: namedGraph.usersWrite[user], permissions: "w"});
          }
      }
      if (permissions!=null) {
            Config.setGraphPermissions(Config.getNS()+namedGraph.name.replace(':',''), JSON.stringify(permissions));
      }
      Config.write();
      return true;
    },

    // saves a named graph in the store
    deleteGraph: function(graphName) {
  		Config.dropGraph(graphName.replace(':',Config.getNS()));
      // if the creation succeed, then delete the metadata
      var settings = Config.getSettings();
      settings[":default-dataset"]["sd:namedGraph"].pop(graphName);
      delete settings[graphName];
      Config.write();
      return true;
    }

  };
  return SettingsService;
});

module.factory('Base64', function() {
    var keyStr = 'ABCDEFGHIJKLMNOP' +
    'QRSTUVWXYZabcdef' +
    'ghijklmnopqrstuv' +
    'wxyz0123456789+/' +
    '=';
return {
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                keyStr.charAt(enc1) +
                keyStr.charAt(enc2) +
                keyStr.charAt(enc3) +
                keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return output;
    },

    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        var base64test = /[^A-Za-z0-9\+\/\=]/g;
        if (base64test.exec(input)) {
            alert("There were invalid base64 characters in the input text.\n" +
                "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                "Expect errors in decoding.");
        }
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        do {
            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";

        } while (i < input.length);

        return output;
	    }
	};
});

module.factory("AccountService", function($cookieStore) {
    var username = null;
    var accountURI = null;
    var email = null;
    var admin = false;

    var getUsername = function() {
        return username;
    };

    var setUsername = function(name) {
        username = name;
    };

    var getAccountURI = function() {
        return accountURI;
    };

    var setAccountURI = function(uri) {
        accountURI = uri;
    };

    var getEmail = function() {
        return email;
    };

    var setEmail = function(mail) {
        email = mail;
    };

    var clear = function() {
        setUsername(null);
        setAccountURI(null);
        setEmail(null);
        setAdmin(false);
    };

    var isLogged = function() {
        return username != null;
    };

    var getAccount = function() {
    	var user = $cookieStore.get('User');
    	var pass = $cookieStore.get('Pass');
        return {username : username, email : email, user: user, pass: pass};
    };

    var setAdmin = function(adm) {
        admin = adm;
    };

    var isAdmin = function() {
        return admin;
    };

    return {
        getUsername     : getUsername,
        setUsername     : setUsername,
        getAccountURI   : getAccountURI,
        setAccountURI   : setAccountURI,
        getEmail        : getEmail,
        setEmail        : setEmail,
        clear           : clear,
        isLogged        : isLogged,
        getAccount      : getAccount,
        isAdmin         : isAdmin,
        setAdmin        : setAdmin
    };
});

module.factory("LoginService", function($http, $location, $cookieStore, AccountService, ConfigurationService, Base64) {
	
    var login = function(username, password) {
    	
    	var username = Base64.decode(username);
    	var password = Base64.decode(password);
    	
        var postData = {
            username: username,
            password: password,
            mode: "login"
        };
        return $http({
                url: "AuthenticationServlet",
                method: "POST",
                data: $.param(postData),
                contentType: "application/x-www-form-urlencoded"
            }).then(function(response) {
                    AccountService.setUsername(response.data.username);
                    AccountService.setAccountURI(response.data.accountURI);
                    AccountService.setEmail(response.data.email);
                    AccountService.setAdmin(response.data.admin);
                    ConfigurationService.setSettingsGraph(response.data.settingsGraph);
                    
                    var encodedUser = Base64.encode(username);
                    var encodedPass = Base64.encode(password);
                    $http.defaults.headers.common.Authorization = 'User ' + encodedUser + ' Pass ' + encodedPass;
                    $cookieStore.put('User', encodedUser);
                    $cookieStore.put('Pass', encodedPass);
                    console.log($http.defaults.headers.common);
                    
                }, function(response) {
                    //todo
            });
    };

    var logout = function() {
        var postData = {
            username: AccountService.getUsername(),
            mode: "logout"
        }
        return $http({
                url: "AuthenticationServlet",
                method: "POST",
                data: $.param(postData),
                contentType: "application/x-www-form-urlencoded"
            }).then(function(response) {
                    AccountService.clear();
                    ConfigurationService.restoreDefaultSettingsGraph();
                    $location.path("/home");
                    
                    document.execCommand("ClearAuthenticationCache");
                    $cookieStore.remove('User');
                    $cookieStore.remove('Pass');
                    $http.defaults.headers.common.Authorization = 'User Pass';
                    
                    console.log($http.defaults.headers.common);
                    
                }, function(response) {
                    //todo
            });
    };

    var createAccount = function(username, email) {
        var postData = {
            username: username,
            email: email,
            mode: "create"
        };
        return $http({
                url: "AuthenticationServlet",
                method: "POST",
                data: $.param(postData),
                contentType: "application/x-www-form-urlencoded"
            });
    };

    var changePassword = function(oldPassword, newPassword) {
        var postData = {
            username: AccountService.getUsername(),
            oldPassword: oldPassword,
            newPassword: newPassword,
            mode: "changePassword"
        };
        return $http({
                url: "AuthenticationServlet",
                method: "POST",
                data: $.param(postData),
                contentType: "application/x-www-form-urlencoded"
            });
    };

    var restorePassword = function(username) {
        var postData = {
            username: username,
            mode: "restorePassword"
        };
        return $http({
                url: "AuthenticationServlet",
                method: "POST",
                data: $.param(postData),
                contentType: "application/x-www-form-urlencoded"
            });
    };

    return {
        login           : login,
        logout          : logout,
        createAccount   : createAccount,
        changePassword  : changePassword,
        restorePassword : restorePassword
    };
});

module.factory("GraphService", function($http, $q, Config, AccountService) {
  var accessModes = {
        ":No" : "No",
        "acl:Read" : "Read" ,
        "acl:Write" : "Write"
  };

  var getNoAccessMode = function() {
    return":No";
  };

  var namedGraphs = {};
  var namedGraphsLoaded = false;

  var readNamedGraphs = function(reload) {
        if (namedGraphsLoaded && !reload) {
            var deferred = $q.defer();
            deferred.resolve(namedGraphs);
            return deferred.promise;
        } else {
            var requestData = {
                format: "application/sparql-results+json",
                username: AccountService.getUsername(),
                mode: "getAllSparql"
            };
            return $http.post("GraphManagerServlet", $.param(requestData)).then(function(result) {
                namedGraphs = Config.parseSparqlResults(result.data);
                namedGraphsLoaded = true;
                return namedGraphs;
            });
        }
  };

  var getAccessibleGraphs = function(onlyWritable, skipOwn, reload) {
        return readNamedGraphs(reload).then(function(data) {
            var results = [];
            for (var resource in data) {
                var namedGraph = data[resource];

                //skip own graphs (if needs)
                if (skipOwn && namedGraph["acl:owner"] == AccountService.getAccountURI())
                    continue;

                //get access mode
                var accessMode = null;
                if (namedGraph["acl:owner"] == AccountService.getAccountURI()) {
                    accessMode = "acl:Write";
                } else {
                    var publicAccessMode = null;
                    var userAccessMode = null;
                    var access = namedGraph["gkg:access"];
                    for (var acc in access) {
                        var agentClass = access[acc]["acl:agentClass"];
                        var agent = access[acc]["acl:agent"];
                        var mode = access[acc]["acl:mode"][0];
                        if (agentClass!=undefined && agentClass[0]=="foaf:Agent" || agent!=undefined && agent[0]==AccountService.getAccountURI()) {
                            if (accessMode==null || accessMode=="acl:Read" && mode=="acl:Write")
                                accessMode = mode;
                        }
                        if (accessMode=="acl:Write")
                            break;
                    }
                }
                if (accessMode==null || onlyWritable && accessMode=="acl:Read")
                    continue;

                //add result
                var res = {
                    name  : namedGraph["sd:name"][0]
                    , graph : {
                        label : namedGraph["sd:graph"][0]["rdfs:label"][0]
                        , description : namedGraph["sd:graph"][0]["dcterms:description"][0]
                        , modified : namedGraph["sd:graph"][0]["dcterms:modified"][0]
                        , created : namedGraph["sd:graph"][0]["dcterms:created"][0]
                        , endpoint : namedGraph["sd:graph"][0]["void:sparqlEndpoint"][0]
                    }
                    , access : accessMode
                };
                results.push(res);
            }
            return results;
        });
    };

    var getAllNamedGraphs = function(reload) {
        return readNamedGraphs(reload).then(function(data) {
            var results = [];
            for (var resource in data) {
                var namedGraph = data[resource];
                var res = {
                    name  : namedGraph["sd:name"][0]
                    , graph : {
                        label : namedGraph["sd:graph"][0]["rdfs:label"][0]
                        , description : namedGraph["sd:graph"][0]["dcterms:description"][0]
                        , modified : namedGraph["sd:graph"][0]["dcterms:modified"][0]
                        , created : namedGraph["sd:graph"][0]["dcterms:created"][0]
                        , endpoint : namedGraph["sd:graph"][0]["void:sparqlEndpoint"][0]
                    }
                    , owner: null
                    , publicAccess : getNoAccessMode()
                    , usersWrite: []
                    , usersRead: []
                };
                var access = namedGraph["gkg:access"];
                if (access != undefined) {
                    for (var acc in access) {
                        var agentClass = access[acc]["acl:agentClass"];
                        var accessMode = access[acc]["acl:mode"][0];
                        if (agentClass != undefined && agentClass[0] == "foaf:Agent") { //public access
                            if (res.publicAccess==getNoAccessMode() || res.publicAccess=="acl:Read" && accessMode=="acl:Write")
                                res.publicAccess = accessMode;
                        } else { //user access
                            if (accessMode == "acl:Write") { res.usersWrite.push(access[acc]["acl:agent"][0]); }
                            else { res.usersRead.push(access[acc]["acl:agent"][0]); }
                        }
                    }
                }
                if (namedGraph["acl:owner"] != undefined)
                    res.owner = namedGraph["acl:owner"][0];
                results.push(res);
            }
            return results;
        });
    };

    var getNamedGraph = function(name) {
            var results = {
                name  : namedGraphs[name]["sd:name"][0] // name is the URI
                , graph : {
                    label : namedGraphs[name]["sd:graph"][0]["rdfs:label"][0]
                    , description : namedGraphs[name]["sd:graph"][0]["dcterms:description"][0]
                    , modified : namedGraphs[name]["sd:graph"][0]["dcterms:modified"][0]
                    , created : namedGraphs[name]["sd:graph"][0]["dcterms:created"][0]
                    , endpoint : namedGraphs[name]["sd:graph"][0]["void:sparqlEndpoint"][0]
                }
                , owner: null
                , publicAccess : getNoAccessMode()
                , usersWrite: []
                , usersRead: []
            };
            var access = namedGraphs[name]["gkg:access"];
            if (access != undefined) {
                for (var acc in access) {
                    var agentClass = access[acc]["acl:agentClass"];
                    var accessMode = access[acc]["acl:mode"][0];
                    if (agentClass != undefined && agentClass[0] == "foaf:Agent") {
                        results.publicAccess = accessMode;
                    } else {
                        if (accessMode == "acl:Write") { results.usersWrite.push(access[acc]["acl:agent"][0]); }
                        else { results.usersRead.push(access[acc]["acl:agent"][0]); }
                    }
                }
            }
            if (namedGraphs[name]["acl:owner"] != undefined)
                results.owner = namedGraphs[name]["acl:owner"][0];
            return results;
    };

    var updateForeignGraph = function(namedGraph) {
        namedGraph.name = Config.getNS()+namedGraph.name.replace(':','')
        var requestData = {
            format: "application/sparql-results+json",
            username: AccountService.getUsername(),
            mode: "updateForeign",
            graph: JSON.stringify(namedGraph)
        };
        return $http.post("GraphManagerServlet", $.param(requestData));
    };

    var deleteForeignGraph = function(graphName) {
        var requestData = {
            format: "application/sparql-results+json",
            username: AccountService.getUsername(),
            mode: "dropForeign",
            graph: graphName.replace(':',Config.getNS())
        };
        return $http.post("GraphManagerServlet", $.param(requestData));
    };

    return {
        readNamedGraphs     : readNamedGraphs,
        getAccessibleGraphs : getAccessibleGraphs,
        getAllNamedGraphs   : getAllNamedGraphs,
        getNamedGraph       : getNamedGraph,
        updateForeignGraph  : updateForeignGraph,
        deleteForeignGraph  : deleteForeignGraph
    };
});

module.factory("GraphGroupService", function($http, $q, Config, AccountService) {
    var GRAPH_URI = Config.getGroupsGraph();
    var GRAPH = "<" + GRAPH_URI + ">";

    var graphGroups = {};
    var graphGroupsLoaded = false;

    var readGraphGroups = function(reload) {
        if (graphGroupsLoaded && !reload) {
            var deferred = $q.defer();
            deferred.resolve(graphGroups);
            return deferred.promise;
        } else {
            var requestData = {
                format: "application/sparql-results+json",
                query: "SELECT * FROM " + GRAPH + " WHERE { ?s ?p ?o } ORDER BY ?s ?p ?o",
                mode: "settings"
            };
            return $http.post("RdfStoreProxy", $.param(requestData)).then(function(response) {
                graphGroups = Config.parseSparqlResults(response.data);
                graphGroupsLoaded = true;
                return graphGroups;
            });
        }
    };

    var getAllGraphGroups = function(reload) {
        return readGraphGroups(reload).then(function(data) {
            var results = [];
            for (var resource in data) {
                var graphGroup = data[resource];
                var res = {
                    name : resource
                    , label : graphGroup["rdfs:label"][0]
                    , description : graphGroup["dcterms:description"][0]
                    , modified : graphGroup["dcterms:modified"][0]
                    , created : graphGroup["dcterms:created"][0]
                    , namedGraphs : graphGroup["sd:namedGraph"]!=undefined ? graphGroup["sd:namedGraph"] : []
                };
                results.push(res);
            }
            return results;
        });
    };

    var getGraphGroup = function(name) {
        var result = {
            name : name
            , label : graphGroups[name]["rdfs:label"][0]
            , description : graphGroups[name]["dcterms:description"][0]
            , modified : graphGroups[name]["dcterms:modified"][0]
            , created : graphGroups[name]["dcterms:created"][0]
            , namedGraphs: graphGroups[name]["sd:namedGraph"]!=undefined ? graphGroups[name]["sd:namedGraph"] : []
        };
        return result;
    };

    var addGraphGroup = function(graphGroup) {
        var uri = Config.getNS()+graphGroup.name.replace(':','');
        var request = {
            mode: "createGroup",
            group: uri,
            graphs: [],
            username: AccountService.getUsername()
        };
        for (var ind in graphGroup.namedGraphs) {
            request.graphs.push(Config.getNS()+graphGroup.namedGraphs[ind].replace(':',''));
        }
        return $http.post("GraphManagerServlet", $.param(request, true))
                .then(function(response) {
                    var data = " <" + uri + "> rdf:type sd:GraphCollection ; "
                                + " rdfs:label \"" + graphGroup.label + "\" ; "
                                + " dcterms:description \"" + graphGroup.description + "\" ; "
                                + " dcterms:modified \"" + graphGroup.modified + "\" ; "
                                + " dcterms:created \"" + graphGroup.created + "\" . "
                    for (var ind in graphGroup.namedGraphs) {
                        data = data + " <" + uri + "> sd:namedGraph <" + Config.getNS()+graphGroup.namedGraphs[ind].replace(':','') + "> . ";
                    }
                    var query = "PREFIX dcterms: <http://purl.org/dc/terms/> "
                                + " PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> "
                                + " PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
                                + " PREFIX sd: <http://www.w3.org/ns/sparql-service-description#> "
                                +  "INSERT INTO " + GRAPH + " { " + data + " } ";
                    var requestData = {
                        format: "application/sparql-results+json",
                        query: query,
                        mode: "settings"
                    };
                    return $http.post("RdfStoreProxy", $.param(requestData));
                });
    };

    var updateGraphGroup = function(graphGroup) {
        var uri = Config.getNS()+graphGroup.name.replace(':','');
        var request = {
            mode: "updateGroup",
            group: uri,
            graphs: [],
            username: AccountService.getUsername()
        };
        for (var ind in graphGroup.namedGraphs) {
            request.graphs.push(Config.getNS()+graphGroup.namedGraphs[ind].replace(':',''));
        }
        return $http.post("GraphManagerServlet", $.param(request, true))
                .then(function(response) {
                    var ngs = "";
                    for (var ind in graphGroup.namedGraphs)
                        ngs = ngs + " ?s sd:namedGraph <" + Config.getNS()+graphGroup.namedGraphs[ind].replace(':','') + "> . ";
                    var query = "PREFIX dcterms: <http://purl.org/dc/terms/> "
                                + " PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> "
                                + " PREFIX sd: <http://www.w3.org/ns/sparql-service-description#> "
                                + " WITH " + GRAPH
                                + " DELETE { ?s rdfs:label ?label . ?s dcterms:description ?descr . ?s dcterms:modified ?modif . ?s sd:namedGraph ?ng . } "
                                + " INSERT { ?s rdfs:label \"" + graphGroup.label + "\" . ?s dcterms:description \"" + graphGroup.description + "\" . ?s dcterms:modified \"" + graphGroup.modified + "\" . " + ngs + " } "
                                + " WHERE { ?s rdfs:label ?label . ?s dcterms:description ?descr . ?s dcterms:modified ?modif . optional {?s sd:namedGraph ?ng .} FILTER (?s = <" + uri + ">) } "
                    var requestData = {
                        format: "application/sparql-results+json",
                        query: query,
                        mode: "settings"
                    };
                    return $http.post("RdfStoreProxy", $.param(requestData));
                });
    };

    var deleteGraphGroup = function(name) {
        var uri = name.replace(':',Config.getNS());
        var request = {
            mode: "dropGroup",
            group: uri,
            username: AccountService.getUsername()
        };
        return $http.post("GraphManagerServlet", $.param(request))
                .then(function(response) {
                    var query = "WITH " + GRAPH + " DELETE {?s ?p ?o} WHERE {?s ?p ?o . FILTER (?s = <" + uri + ">) }";
                    var requestData = {
                        format: "application/sparql-results+json",
                        query: query,
                        mode: "settings"
                    };
                    return $http.post("RdfStoreProxy", $.param(requestData));
                });
    };

    return {
        readGraphGroups     : readGraphGroups,
        getAllGraphGroups   : getAllGraphGroups,
        getGraphGroup       : getGraphGroup,
        addGraphGroup       : addGraphGroup,
        updateGraphGroup    : updateGraphGroup,
        deleteGraphGroup    : deleteGraphGroup
    };
});

module.factory("OntologyService", function($http, $q, ConfigurationService) {
    var d2rqServices = ConfigurationService.getComponentServices(":D2RQ");
    var d2rqServiceUrl = d2rqServices[0].serviceUrl;

    var ontologies = [];
    var isLoaded = false;

    var readOntologies = function() {
        if (isLoaded) {
            var deferred = $q.defer();
            deferred.resolve(ontologies);
            return deferred.promise;
        } else {
            return $http.get(d2rqServiceUrl + "/ontologies/uris/get")
                .then(function(response) {
                    ontologies = response.data;
                    isLoaded = true;
                });
        }
    };

    var refreshOntologies = function() {
        isLoaded = false;
        return readOntologies();
    };

    var getAllOntologies = function() {
        return ontologies;
    };

    return {
        readOntologies      : readOntologies,
        refreshOntologies   : refreshOntologies,
        getAllOntologies    : getAllOntologies
    };
});

module.factory("D2RQService", function($http, $q, ConfigurationService) {
    var d2rqServices = ConfigurationService.getComponentServices(":D2RQ");
    var d2rqServiceUrl = d2rqServices[0].serviceUrl;

    var mappingGroups = [];
    var tasks = [];

    var mappingGroupsLoaded = false;
    var tasksLoaded = false;

    var readMappingGroups = function() {
        if (mappingGroupsLoaded) {
            var deferred = $q.defer();
            deferred.resolve(mappingGroups);
            return deferred.promise;
        } else {
            return $http.get(d2rqServiceUrl + "/mappings/groups/metadata/get")
                .then(function(response) {
                    mappingGroups = response.data;
                    mappingGroupsLoaded = true;
                });
        }
    };

    var refreshMappingGroups = function() {
        mappingGroupsLoaded = false;
        return readMappingGroups();
    };

    var getAllMappingGroups = function() {
        return mappingGroups;
    };

    var readTasks = function() {
        if (tasksLoaded) {
            var deferred = $q.defer();
            deferred.resolve(tasks);
            return deferred.promise;
        } else {
            return $http.get(d2rqServiceUrl + "/tasks/metadata/get")
                .then(function(response) {
                    tasks = response.data;
                    tasksLoaded = true;
                });
        }
    };

    var refreshTasks = function() {
        tasksLoaded = false;
        return readTasks();
    };

    var getAllTasks = function() {
        return tasks;
    };

    return {
        readMappingGroups   : readMappingGroups,
        refreshMappingGroups: refreshMappingGroups,
        getAllMappingGroups : getAllMappingGroups,
        readTasks           : readTasks,
        refreshTasks        : refreshTasks,
        getAllTasks         : getAllTasks
    };
});

module.factory("DocumentsService", function($http, $q, Config, DateService, ConfigurationService) {
    var documentTypes = [
        {value:"Generic Specification", label:"Generic Specification"},
        {value:"Project-specific Specification", label:"Project-specific Specification"},
        {value:"other", label:"Other"}
    ];

    var GRAPH = Config.getDocumentsGraph();

    var documents = {};
    var documentsLoaded = false;

    var projects = {};
    var projectsLoaded = false;

    var owners = {};
    var ownersLoaded = false;

    var getDocumentTypes = function() {
        return documentTypes;
    };

    var readDocuments = function() {
        var requestData = {
            format: "application/sparql-results+json",
            query: "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>"
                    + " prefix acc: <" + Config.getDocumentsNS() + ">"
                    + " SELECT ?s ?p ?o FROM <" + GRAPH + "> "
                    + " WHERE {?s ?p ?o . ?s rdf:type acc:AccDocument . FILTER(NOT EXISTS {?s acc:pageNumber ?pn}) } "
                    + " ORDER BY ?s ?p ?o",
            mode: "settings"
        };
        return $http.post("RdfStoreProxy", $.param(requestData)).then(function(response) {
            documents = Config.parseSparqlResults(response.data);
            documentsLoaded = true;
            return documents;
        });
    };

    var reloadDocuments = function() {
        var documentsPromise = readDocuments();
        var projectsPromise = readProjects();
        var ownersPromise = readOwners();
        return $q.all([documentsPromise, projectsPromise, ownersPromise]).then(function(data) {
            return getAllDocuments();
        });
    };

    var getAllDocuments = function() {
        var results = [];
        for (var resource in documents) {
            var res = getDocument(resource);
            results.push(res);
        }
        return results;
    };

    var getDocument = function(uri) {
        var doc = documents[uri];
        var res = {
            uri: uri,
            uuid: doc["acc:uuid"][0],
            accDocumentNumber: doc["acc:accDocumentNumber"][0],
            accDocumentIteration: doc["acc:accDocumentIteration"][0],
            hasProject: [],
            owner: doc["dc:creator"][0],
            documentType: doc["acc:documentType"][0],
            ownerDocumentNumber: doc["acc:ownerDocumentNumber"]==undefined ? null : doc["acc:ownerDocumentNumber"][0],
            ownerDocumentName: doc["acc:ownerDocumentName"]==undefined ? null : doc["acc:ownerDocumentName"][0],
            ownerDocumentRevision: doc["acc:ownerDocumentRevision"]==undefined ? null : doc["acc:ownerDocumentRevision"][0],
            ownerDocumentRevisionData: null,
            isApplicable: doc["acc:isApplicable"][0],
            accDescription: doc["acc:accDescription"]==undefined ? null : doc["acc:accDescription"][0],
            accNote: doc["acc:accNote"]==undefined ? null : doc["acc:accNote"][0],
            uploader: doc["acc:uploader"][0],
            dateUploaded: doc["acc:dateUploaded"][0]
        };
        //accNote
        if (res.accNote!=null && res.accNote.value==="") res.accNote = "";
        //dateReceived
        var dr = new Date();
        dr.setTime(Date.parse(doc["acc:dateReceived"][0]));
        res.dateReceived = DateService.formatDateXsd(dr);
        //ownerDocumentRevisionData
        if (doc["acc:ownerDocumentRevisionData"]!=undefined) {
            var date = new Date();
            date.setTime(Date.parse(doc["acc:ownerDocumentRevisionData"][0]));
            res.ownerDocumentRevisionData = DateService.formatDateXsd(date);
        }
        //isApplicable
        if (res.isApplicable=="1" || res.isApplicable=="true") res.isApplicable = true;
        else if (res.isApplicable=="0" || res.isApplicable=="false") res.isApplicable = false;
        //hasProject
        for (var ind in doc["acc:hasProject"]) {
            var projUri = doc["acc:hasProject"][ind];
            var proj = {
                uri: projUri,
                name: projects[projUri]["acc:name"][0]
            };
            res.hasProject.push(proj);
        }
        return res;
    };

    var deleteDocument = function(id) {
        var services = ConfigurationService.getComponentServices(":SolrUploadProxy");
    	var solrUploadServiceUrl = services[0].serviceUrl;

        return $http.post(solrUploadServiceUrl+"/update/deleteDocument?uuid="+id);

//        var query = "prefix acc: <" + Config.getDocumentsNS() + "> WITH <" + GRAPH + "> DELETE {?s ?p ?o} WHERE {?s acc:uuid \"" + id + "\" . ?s ?p ?o .}";
//        var requestData = {
//            format: "application/sparql-results+json",
//            query: query,
//            mode: "settings"
//        };
//        return $http.post("RdfStoreProxy", $.param(requestData));
    };

    var updateDocument = function(document) {
        var hasProjectTriples = "";
        var newProjectTriples = "";
        for (var ind in document.hasProject) {
            hasProjectTriples += " ?s acc:hasProject " + document.hasProject[ind].uri + " . ";
            if (document.hasProject[ind].created) {
                newProjectTriples += document.hasProject[ind].uri + " rdf:type acc:AccProject . "
                                    + document.hasProject[ind].uri + " acc:name \"" + document.hasProject[ind].name + "\" . ";
            }
        }
        var newOwnerTriples = "";
        if (document.owner.created) {
            newOwnerTriples += document.owner.uri + " rdf:type acc:Owner . "
                                + document.owner.uri + " acc:name \"" + document.owner.name + "\" . ";
        }
        var query = "prefix acc: <" + Config.getDocumentsNS() + "> "
                    + " prefix xsd: <http://www.w3.org/2001/XMLSchema#> "
                    + " prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
                    + " WITH <" + GRAPH + "> "
                    + " DELETE {?s acc:accDocumentNumber ?adn . "
                            + " ?s acc:accDocumentIteration ?adi . "
                            + " ?s acc:hasProject ?proj . "
                            + " ?s dc:creator ?owner . "
                            + " ?s acc:documentType ?dt . "
                            + " ?s acc:ownerDocumentNumber ?num . "
                            + " ?s acc:ownerDocumentName ?odn . "
                            + " ?s acc:ownerDocumentRevision ?odr . "
                            + " ?s acc:ownerDocumentRevisionData ?odrd . "
                            + " ?s acc:isApplicable ?a . "
                            + " ?s acc:accDescription ?descr . "
                            + " ?s acc:accNote ?note . "
                            + " ?s acc:dateReceived ?dr .} "
                    + " INSERT {?s acc:accDocumentNumber \"" + document.accDocumentNumber + "\" . "
                            + " ?s acc:accDocumentIteration \"" + document.accDocumentIteration + "\" . "
                            + hasProjectTriples
                            + newProjectTriples
                            + " ?s dc:creator " + document.owner.uri + " . "
                            + newOwnerTriples
                            + " ?s acc:documentType \"" + document.documentType + "\" . "
                            + (document.ownerDocumentNumber==null || document.ownerDocumentNumber=="" ? "" : " ?s acc:ownerDocumentNumber \"" + document.ownerDocumentNumber + "\" . ")
                            + (document.ownerDocumentName==null || document.ownerDocumentName=="" ? "" : " ?s acc:ownerDocumentName \"" + document.ownerDocumentName + "\" . ")
                            + (document.ownerDocumentRevision==null || document.ownerDocumentRevision=="" ? "" : " ?s acc:ownerDocumentRevision \"" + document.ownerDocumentRevision + "\" . ")
                            + (document.ownerDocumentRevisionData==null || document.ownerDocumentRevisionData=="" ? "" : " ?s acc:ownerDocumentRevisionData \"" + document.ownerDocumentRevisionData + "\"^^xsd:date . ")
                            + " ?s acc:isApplicable \"" + document.isApplicable + "\" . "
                            + (document.accDescription==null || document.accDescription=="" ? "" : " ?s acc:accDescription \"" + document.accDescription + "\" . ")
                            + (document.accNote==null || document.accNote=="" ? "" : " ?s acc:accNote \"" + document.accNote + "\" . ")
                            + " ?s acc:dateReceived \"" + document.dateReceived + "\"^^xsd:date .} "
                    + " WHERE {?s acc:uuid \"" + document.uuid + "\" . "
                            + " ?s acc:accDocumentNumber ?adn . "
                            + " ?s acc:accDocumentIteration ?adi . "
                            + " optional {?s acc:hasProject ?proj .} "
                            + " optional {?s dc:creator ?owner .} "
                            + " ?s acc:documentType ?dt . "
                            + " optional {?s acc:ownerDocumentNumber ?num .} "
                            + " optional {?s acc:ownerDocumentName ?odn .} "
                            + " optional {?s acc:ownerDocumentRevision ?odr .} "
                            + " optional {?s acc:ownerDocumentRevisionData ?odrd .} "
                            + " ?s acc:isApplicable ?a . "
                            + " optional {?s acc:accDescription ?descr .} "
                            + " optional {?s acc:accNote ?note .} "
                            + " ?s acc:dateReceived ?dr .} ";
        var requestData = {
            format: "application/sparql-results+json",
            query: query,
            mode: "settings"
        };
        return $http.post("RdfStoreProxy", $.param(requestData));
    };

    var readProjects = function() {
        var requestData = {
            format: "application/sparql-results+json",
            query: "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n"
                    + "prefix acc: <" + Config.getDocumentsNS() + ">\n"
                    + "SELECT ?s ?p ?o FROM <" + GRAPH + "> "
                    + " WHERE { ?s ?p ?o . ?s rdf:type acc:AccProject } "
                    + " ORDER BY ?s ?p ?o",
            mode: "settings"
        };
        return $http.post("RdfStoreProxy", $.param(requestData)).then(function(response) {
            projects = Config.parseSparqlResults(response.data);
            projectsLoaded = true;
            return projects;
        });
    };

    var getAllProjects = function() {
        var results = [];
        for (var resource in projects) {
            var proj = projects[resource];
            var res = {
                    uri: resource,
                    name: proj["acc:name"][0]
            };
            results.push(res);
        }
        return results;
    };

    var readOwners = function() {
        var requestData = {
            format: "application/sparql-results+json",
            query: "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n"
                    + "prefix acc: <" + Config.getDocumentsNS() + ">\n"
                    + "SELECT ?s ?p ?o FROM <" + GRAPH + "> "
                    + " WHERE { ?s ?p ?o . ?s rdf:type acc:Owner } "
                    + " ORDER BY ?s ?p ?o",
            mode: "settings"
        };
        return $http.post("RdfStoreProxy", $.param(requestData)).then(function(response) {
            owners = Config.parseSparqlResults(response.data);
            ownersLoaded = true;
            return owners;
        });
    };

    var getAllOwners = function() {
        var results = [];
        for (var resource in owners) {
            var o = owners[resource];
            var res = {
                uri: resource,
                name: o["acc:name"][0]
            };
            results.push(res);
        }
        return results;
    };

    return {
        getDocumentTypes: getDocumentTypes,
        readDocuments   : readDocuments,
        reloadDocuments : reloadDocuments,
        getAllDocuments : getAllDocuments,
        getDocument     : getDocument,
        deleteDocument  : deleteDocument,
        updateDocument  : updateDocument,
        readProjects    : readProjects,
        getAllProjects  : getAllProjects,
        readOwners      : readOwners,
        getAllOwners    : getAllOwners
    };
});