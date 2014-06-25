'use strict';

var UploadDocCtrl = function($scope, $http, flash, ServerErrorResponse, ConfigurationService, DocumentsService, AccountService, localize, DocumentErrorResponse) {
    var service = ConfigurationService.getService(":DocumentUploadService");
	var serviceUrl = service.serviceUrl;

    $scope.projects = DocumentsService.getAllProjects();

    $scope.owners = [];
    var allOwners = DocumentsService.getAllOwners();
    for (var ind in allOwners) {
        $scope.owners.push(allOwners[ind].name);
    }

	$scope.documentTypes = DocumentsService.getDocumentTypes();

    $scope.uploading = false;

    $scope.onFileSelect = function($files) {
        $scope.fileList = $files;
    };

    $scope.upload = function() {
        $scope.uploading = true;
        for (var i = 0; i < $scope.fileList.length; i++) {
            var f = $scope.fileList[i];
            $http.uploadFile({
                    url: serviceUrl,
                    file: f,
                    data: $scope.document
                }).then(function(response) {
                    $scope.uploading = false;
                    flash.success = localize.getLocalizedString("_uploading-finished-message_");;
                }, function(response) {
                    $scope.uploading = false;
                    if (response.status == 500) flash.error = ServerErrorResponse.getMessage(response.status) + ": " + DocumentErrorResponse.getMessage(parseInt(response.data));
                    else flash.error = ServerErrorResponse.getMessage(response.status);
                });
        }
    };

    $scope.isUploading = function() {
        return $scope.uploading;
    };

    $scope.addNewOwner = function() {
        if ($scope.newOwnerName!=null && $scope.newOwnerName!="" && $scope.owners.indexOf($scope.newOwnerName) == -1) {
            $scope.owners.push($scope.newOwnerName);
            $scope.document.ownerName = $scope.newOwnerName;
        }
        $scope.newOwnerName = null;
        $scope.showOwnerTextField = false;
    };

    $scope.projectExists = function(projectNumber) {
        for (var ind in $scope.projects) {
            if ($scope.projects[ind].number==projectNumber) return true;
        }
        return false;
    };

    $scope.addNewProject = function() {
        if ($scope.newProjectName && $scope.newProjectNumber && !$scope.projectExists($scope.newProjectNumber)) {
            $scope.projects.push({number: $scope.newProjectNumber, name: $scope.newProjectName});
            $scope.document.projectNumber = $scope.newProjectNumber;
            $scope.document.projectName = $scope.newProjectName;
        }
        $scope.newProjectName = null;
        $scope.newProjectNumber = null;
        $scope.showProjectTextField = false;
    };

    $scope.projectChanged = function() {
        for (var ind in $scope.projects) {
            if ($scope.projects[ind].number==$scope.document.projectNumber) {
                $scope.document.projectName = $scope.projects[ind].name;
                break;
            }
        }
    };

    $scope.clearForm = function() {
        $scope.fileList = null;
        $scope.document = {
            accDocumentNumber : "",
            accDocumentIteration : "",
            dateReceived : "",
            documentType : "customer specification",
            isApplicable : true,
            projectNumber : "",
            projectName : "",
            ownerName : "",
            ownerDocumentNumber: "",
            ownerDocumentName : "",
            ownerDocumentRevision : "",
            ownerDocumentRevisionData : "",
            accDescription : "",
            accNote : "",
            uploader : AccountService.getUsername()
        };
        $scope.showOwnerTextField = false;
        $scope.showProjectTextField = false;
        $scope.newOwnerName = null;
        $scope.newProjectNumber = null;
        $scope.newProjectName = null;
    };

    $scope.clearForm();

    $scope.filesSelected = function() {
        return $scope.fileList!=null && $scope.fileList.length > 0;
    };
};