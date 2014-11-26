'use strict';

function AccountCtrl($scope, $http, $cookieStore, flash, AccountService, LoginService, ServerErrorResponse, Base64, AuthenticationErrorResponse) {

    $scope.account = $scope.$parent.currentAccount;
    $scope.password = {oldPassword: null, newPassword:null, confirmPassword:null};

    $('i').tooltip();

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
                if (response.status==500 && response.data) {
                    flash.error = AuthenticationErrorResponse.getMessage(parseInt(response.data.code));
                } else {
                    flash.error = ServerErrorResponse.getMessage(response);
                }
            });
    };

    $scope.clearChangePasswordForm = function() {
        $scope.changePasswordForm.$setPristine();

        $scope.password.newPassword = null;
        $scope.password.oldPassword = null;
        $scope.password.confirmPassword = null;
    };

    // understand what is the point of having this...
    // $scope.$watch( function() { 
    //     return AccountService.getAccount(); 
    // }, function() {
    //     $scope.account = AccountService.getAccount().getData();
    // }, true);
}