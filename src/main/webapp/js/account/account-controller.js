'use strict';

function AccountCtrl($scope, $http, $cookieStore, flash, AccountService, LoginService, ServerErrorResponse, Base64) {
    $scope.currentAccount = angular.copy(AccountService.getAccount());

    $scope.password = {oldPassword: null, newPassword:null, confirmPassword:null};

    $scope.changePassword = function() {
        LoginService.changePassword($scope.password.oldPassword, $scope.password.newPassword)
            .then(function(response) {
                $('#modalChangePassword').modal('hide');
                $('body').removeClass('modal-open');
              	$('.modal-backdrop').slideUp();
              	$('.modal-scrollable').slideUp();
                flash.success = response.data.message;
                //Reset cookie
                var encodedUser = Base64.encode(AccountService.getUsername());
                var encodedPass = Base64.encode($scope.password.newPassword);
                $http.defaults.headers.common.Authorization = 'User ' + encodedUser + ' Pass ' + encodedPass;
                $cookieStore.put('User', encodedUser);
                $cookieStore.put('Pass', encodedPass);
                
            }, function(response) {
                $('#modalChangePassword').modal('hide');
                $('body').removeClass('modal-open');
              	$('.modal-backdrop').slideUp();
              	$('.modal-scrollable').slideUp();
                flash.error = ServerErrorResponse.getMessage(response.status);
            });
    };

    $scope.clearChangePasswordForm = function() {
        $scope.changePasswordForm.$setPristine();

        $scope.password.newPassword = null;
        $scope.password.oldPassword = null;
        $scope.password.confirmPassword = null;
    };

    $scope.$watch( function() { return AccountService.getAccount(); }, function() {
        $scope.currentAccount = angular.copy(AccountService.getAccount());
    }, true);
}