'use strict';

function AccountCtrl($scope, flash, AccountService, LoginService, ServerErrorResponse) {
    $scope.currentAccount = angular.copy(AccountService.getAccount());

    $scope.changePassword = function() {
        LoginService.changePassword($scope.password.oldPassword, $scope.password.newPassword)
            .then(function(response) {
                $('#modalChangePassword').modal('hide');
                $('body').removeClass('modal-open');
              	$('.modal-backdrop').slideUp();
              	$('.modal-scrollable').slideUp();
                flash.success = response.data.message;
            }, function(response) {
                $('#modalChangePassword').modal('hide');
                $('body').removeClass('modal-open');
              	$('.modal-backdrop').slideUp();
              	$('.modal-scrollable').slideUp();
                flash.error = ServerErrorResponse.getMessage(response.status);
            });
    };

    $scope.$watch( function() { return AccountService.getAccount(); }, function() {
        $scope.currentAccount = angular.copy(AccountService.getAccount());
    }, true);
}