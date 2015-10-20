'use strict';

function ModalJobCtrl($scope, $modalInstance, GraphService, Ns, mConf) {

    $scope.modaltitle ="New Job";
    var mprefix ="job";
    if(mConf.title!=undefined)
      $scope.modaltitle = mConf.title;
    if(mConf.prefix!=undefined)
      mprefix = mConf.prefix;

    $scope.job = {
      name : "",
      label:"",
      description : "",
      namedgraph:null,
      newRevision:true,
      additionalSources: true,
    };

    //scope variables used in the target-graph direcitve
    $scope.target = { graph : ""};
    $scope.newTarget ={
      prefix :  mprefix,
      label : "",
      description : ""
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
      $scope.newTarget.label = "Job from " + $scope.job.label;
    };

    $scope.updateNewTargetDescription = function () {
      $scope.newTarget.description = "Job from " + $scope.job.description;
    };

  }