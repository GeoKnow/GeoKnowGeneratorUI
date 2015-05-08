'use strict';

function AccountCtrl($scope,$sce, $http, $modal, flash, AccountService, LoginService, ServerErrorResponse, Base64, AuthenticationErrorResponse) {
    
    $scope.account = AccountService.getAccount();
    
    $scope.changePassword = function() {
        
        var modalInstance = $modal.open({
            templateUrl: 'modal-forms/modal-change-pw.html',
            controller: 'ModalChangePwCtrl',
            size: 'lg',
            backdrop: 'static',
            resolve: {
            currentTemplate: function () {
                return null;
            }
            }
        });
        
        
        modalInstance.result.then(function (password) {         
            
            LoginService.changePassword(password.oldPassword, password.newPassword)
            .then(function(response) {
                flash.success = response.data.message;
            }, function(response) {
                
                if (response.status==500 && response.data) {
                    flash.error = AuthenticationErrorResponse.getMessage(parseInt(response.data.code));
                } else {
                    flash.error = ServerErrorResponse.getMessage(response);
                }
            });
            
        });
        
        
    };

    //$scope.$watch( function() { return AccountService.getAccount(); }, function() {
      //  $scope.currentAccount = angular.copy(AccountService.getAccount());
    //}, true);
}