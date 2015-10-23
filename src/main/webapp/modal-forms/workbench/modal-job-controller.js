'use strict';

function ModalJobCtrl($scope, $modalInstance, GraphService, Ns, modalConfiguration) {


    $scope.modaltitle=modalConfiguration.title;

    $scope.job = {
      name : "",
      label:"",
      description : "",
      namedgraph:null,
      newRevision:true,
      additionalSources: true,
    };

    //scope variables used in the target-graph direcitve  
    $scope.target = { 
      label : "",
      graph : "",
      isNew : {
        prefix : modalConfiguration.service ,
        label : "",
        description : ""
      }
    };
    
    $scope.ok = function () {
      
      var today = new Date();
      $scope.job.name = $scope.job.label.replace(/[^a-zA-Z0-9]/g,'') + today.valueOf();
      $scope.job.namedgraph = Ns.lengthen($scope.target.graph);
      console.log($scope.job);
      var input= angular.copy($scope.job)
      $modalInstance.close(input);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.updateNewTargetLabel = function () {
      $scope.target.isNew.label = modalConfiguration.service+ " from " + $scope.job.label;
    };

    $scope.updateNewTargetDescription = function () {
      $scope.target.isNew.description = "Resulct of "+  modalConfiguration.service+ " : " + $scope.job.description;
    };

  }