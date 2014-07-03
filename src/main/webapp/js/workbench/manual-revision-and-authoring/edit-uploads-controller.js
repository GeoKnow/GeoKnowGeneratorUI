'use strict';

var UploadedDocsCtrl = function($scope, $http, flash, filterFilter, orderByFilter, DocumentsService, ServerErrorResponse, ConfigurationService, localize, DocumentErrorResponse, $window) {
    $scope.filterFields = [
        {value: "all", label: "_all-fields_"},
        {value: "docId", label: "_acc-doc_"},
        {value: "hasProject", label: "_project-number_"},
        {value: "ownerDocumentNumber", label: "_owner-doc-number_"},
        {value: "ownerDocumentName", label: "_owner-doc-name_"},
        {value: "ownerDocumentRevision", label: "_owner-doc-revision_"},
        {value: "dateUploaded", label: "_doc-uploaded_"}
    ];

    $scope.localize = function(str) {
        return localize.getLocalizedString(str);
    };

    $scope.search = [
        {text: null, fields: ["all"]}
    ];

    $scope.documentTypes = DocumentsService.getDocumentTypes();
    $scope.documents = DocumentsService.getAllDocuments();
    $scope.projects = DocumentsService.getAllProjects();
    $scope.owners = DocumentsService.getAllOwners();

    $scope.showCreateProject = false;
    $scope.showCreateOwner = false;

    $scope.filteredDocuments = angular.copy($scope.documents);
    $scope.sortedDocuments = angular.copy($scope.documents);

    $scope.curPageNum = 1;
    $scope.itemsPerPage = 10;
    $scope.curPageDocs = [];
    $scope.totalDocs = $scope.filteredDocuments.length;

    var fillPage = function() {
        $scope.curPageDocs = [];
        for (var i = ($scope.curPageNum-1)*$scope.itemsPerPage; i < Math.min($scope.curPageNum*$scope.itemsPerPage, $scope.filteredDocuments.length); i++) {
            $scope.curPageDocs.push($scope.filteredDocuments[i]);
        }
    };

    fillPage();

    $scope.$watch('curPageNum', function() {
        fillPage();
    }, true);

    var documentsFilter = function(document) {
        if ($scope.searchText==undefined || $scope.searchText==null || $scope.searchText=="") return true;
        if ($scope.getDocumentId(document).indexOf($scope.searchText) > -1) return true;
        for (var ind in document.hasProject) {
            if (document.hasProject[ind].number.indexOf($scope.searchText) > -1) return true;
            if (document.hasProject[ind].name.indexOf($scope.searchText) > -1) return true;
        }
        if (document.ownerDocumentNumber.indexOf($scope.searchText) > -1) return true;
        if (document.ownerDocumentName.indexOf($scope.searchText) > -1) return true;
        if (document.ownerDocumentRevision.indexOf($scope.searchText) > -1) return true;
        if ($scope.formatDateTime(document.dateUploaded).indexOf($scope.searchText) > -1) return true;
        return false;
    };

    var documentsIdFilter = function(document) {
        if (!$scope.searchText) return true;
        return $scope.getDocumentId(document).indexOf($scope.searchText) > -1;
    };

    var projectNumberFilter = function(document) {
        if (!$scope.searchText) return true;
        for (var ind in document.hasProject) {
            if (document.hasProject[ind].number.indexOf($scope.searchText) > -1) return true;
        }
        return false;
    };

    var dateUploadedFilter = function(document) {
        if (!$scope.searchText) return true;
        var formattedDate = $scope.formatDateTime(document.dateUploaded);
        return formattedDate.indexOf($scope.searchText) > -1;
    };

    var filterUnion = function(filters, fields) {
        return function(document) {
            if (!$scope.searchText || filters.length==0 && fields.length==0) return true;
            for (var ind in filters) {
                if (filters[ind](document)) return true;
            }
            for (var ind in fields) {
                if (document[fields[ind]].indexOf($scope.searchText) > -1) return true;
            }
            return false;
        };
    };

    var buildFilterExpression = function() {
        var filterExpr;
        if ($scope.searchField.indexOf("all") > -1) { //ignore other search options
            filterExpr = documentsFilter;
        } else {
            var filters = [];
            var fields = [];
            for (var ind in $scope.searchField) {
                if ($scope.searchField[ind] == "docId") filters.push(documentsIdFilter);
                else if ($scope.searchField[ind] == "hasProject") filters.push(projectNumberFilter);
                else if ($scope.searchField[ind] == "dateUploaded") filters.push(dateUploadedFilter);
                else fields.push($scope.searchField[ind]);
            }
            filterExpr = filterUnion(filters, fields);
        }
        return filterExpr;
    };

    $scope.filter = function() {
        $scope.searchField = $scope.search[0].fields;
        $scope.searchText = $scope.search[0].text;
        var filterExpr = buildFilterExpression();
        $scope.filteredDocuments = filterFilter($scope.sortedDocuments, filterExpr);
        if ($scope.search.length > 0) {
            for (var ind in $scope.search) {
                if (ind==0) continue;
                $scope.searchField = $scope.search[ind].fields;
                $scope.searchText = $scope.search[ind].text;
                var filterExpr = buildFilterExpression();
                $scope.filteredDocuments = filterFilter($scope.filteredDocuments, filterExpr);
            }
        }
        $scope.totalDocs = $scope.filteredDocuments.length;
        fillPage();
    };

    $scope.addSearch = function() {
        $scope.search.push({text: null, fields: ["all"]});
    };

    $scope.removeSearch = function(s) {
        var removeIndex = $scope.search.indexOf(s);
        $scope.search.splice(removeIndex, 1);
        $scope.filter();
    };

    $scope.showRemoveSearch = function(s) {
        return $scope.search.length > 1;
    };

    $scope.showAddSearch = function(s) {
        return $scope.search.indexOf(s) == $scope.search.length-1;
    };

    $scope.sort = function() {
        $scope.sortedDocuments = orderByFilter($scope.documents, $scope.sortPredicate, $scope.sortReverse);
        $scope.filter();
    };

    $scope.refreshDocuments = function() {
        DocumentsService.reloadDocuments().then(function(result) {
            $scope.documents = result;
            $scope.filteredDocuments = angular.copy($scope.documents);
            $scope.totalDocs = $scope.filteredDocuments.length;
            fillPage();
            $scope.projects = DocumentsService.getAllProjects();
            $scope.owners = DocumentsService.getAllOwners();
        });
    };

    $scope.edit = function(uri) {
        $scope.document = angular.copy(DocumentsService.getDocument(uri));
        for (var ind in $scope.owners) {
            if ($scope.owners[ind].uri==$scope.document.owner) {
                $scope.document.owner = $scope.owners[ind];
                break;
            }
        }
        $scope.newAssignedProject = null;
        $scope.newProjectName = null;
        $scope.newProjectNumber = null;
        $scope.newOwnerName = null;
        $scope.showCreateProject = false;
        $scope.showCreateOwner = false;
    };

    $scope.save = function() {
        DocumentsService.updateDocument($scope.document).then(function(response) {
            $scope.refreshDocuments();
            $scope.close('#modalDocument');
            flash.success = localize.getLocalizedString("_changes-saved-message_");
            $window.scrollTo(0,0);
            //reindex document
            var services = ConfigurationService.getComponentServices(":DocumentComponent", "lds:AuthoringService");
            var serviceUrl = services[0].serviceUrl;
            $http.post(serviceUrl+"/update/reindexDocument?uuid="+$scope.document.uuid)
                .then(function(response) {
                    console.log("Document " + $scope.document.uuid + " reindex completed");
                    console.log(response.data);
                }, function(response) {
                    console.log("Document " + $scope.document.uuid + " reindex failed");
                    console.log(response);
                });
        }, function(response) {
            $scope.close('#modalDocument');
            flash.error = ServerErrorResponse.getMessage(response.status);
            $window.scrollTo(0,0);
        });
    };

    $scope.delete = function(id) {
        DocumentsService.deleteDocument(id).then(function(response) {
            $scope.refreshDocuments();
            console.log("Document " + id + " was deleted")
        }, function(response) {
            if (response.status==500) flash.error = ServerErrorResponse.getMessage(response.status) + ": " + DocumentErrorResponse.getMessage(parseInt(response.data));
            else flash.error = ServerErrorResponse.getMessage(response.status);
            $window.scrollTo(0,0);
        });
    };

    $scope.createOwner = function(name) {
        return {
            uri: "acc:owner_" + name.split(" ").join("_"),
            name: name,
            created: true
        };
    };

    $scope.ownerExists = function(ownerName) {
        for (var ind in $scope.owners) {
            if ($scope.owners[ind].name==ownerName) return true;
        }
        return false;
    };

    $scope.addNewOwner = function() {
        if ($scope.newOwnerName!=null && $scope.newOwnerName!="" && !$scope.ownerExists($scope.newOwnerName)) {
            var o = $scope.createOwner($scope.newOwnerName);
            //add to owners list
            $scope.owners.push(o);
            //change current document owner
            $scope.document.owner = o;
        };
        $scope.newOwnerName = null;
        $scope.showCreateOwner = false;
    };

    $scope.createProject = function(name, number) {
        return {
            uri: "acc:project_" + name.split(" ").join("_"),
            name: name,
            number: number,
            created: true
        };
    };

    $scope.projectExists = function(projectNumber) {
        for (var ind in $scope.projects) {
            if ($scope.projects[ind].number==projectNumber) return true;
        }
        return false;
    };

    $scope.addNewProject = function() {
        if ($scope.newProjectNumber && $scope.newProjectName && !$scope.projectExists($scope.newProjectNumber)) {
            var p = $scope.createProject($scope.newProjectName, $scope.newProjectNumber);
            //add to projects list
            $scope.projects.push(p);
            //assign to current document
            $scope.newAssignedProject = p;
            $scope.assignProject();
        }
        $scope.newProjectName = null;
        $scope.newProjectNumber = null;
        $scope.showCreateProject = false;
    };

    $scope.removeProject = function(project) {
        var index = $scope.document.hasProject.indexOf(project);
        if (index > -1) $scope.document.hasProject.splice(index, 1);
    };

    $scope.assignProject = function() {
        var project = $scope.newAssignedProject;
        if (project != null && $scope.document.hasProject.indexOf(project) == -1) {
            $scope.document.hasProject.push(project);
        }
        $scope.newAssignedProject = null;
    };

    $scope.notAssigned = function(project) {
        if ($scope.document==undefined) return true;
        for (var ind in $scope.document.hasProject) {
            if ($scope.document.hasProject[ind].uri==project.uri)
                return false;
        }
        return true;
    };

    $scope.getDocumentId = function(document) {
        return document.accDocumentNumber + "-" + document.accDocumentIteration;
    };

    $scope.close = function(modalID) {
        $(modalID).modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').slideUp();
        $('.modal-scrollable').slideUp();
    };

    $scope.formatDateTime = function(dateStr) {
        //YYYY-MM-DD HH:MM
        var date = new Date();
        date.setTime(Date.parse(dateStr));
        var month = date.getMonth() + 1; // getMonth returns values from 0 to 11
        var s_date = date.getFullYear() + "-"
                        + (month.toString().length==1 ? "0"+ month : month) + "-"
                        + (date.getDate().toString().length==1 ? "0"+date.getDate() : date.getDate()) + " "
                        + date.getHours() + ":" + date.getMinutes();
        return s_date;
    };
};