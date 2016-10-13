(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader')
        .component('znkHeader', {
            bindings: {},
            templateUrl:  'components/znkHeader/components/znkHeader/znkHeader.template.html',
            controllerAs: 'vm',
            controller: function ($scope, $translatePartialLoader, $window, purchaseService, znkHeaderSrv, OnBoardingService, SettingsSrv,
                                  UserProfileService, $injector, PurchaseStateEnum, userGoalsSelectionService, AuthService, ENV, $timeout) {
                'ngInject';
                $translatePartialLoader.addPart('znkHeader');

                var vm = this;
                vm.expandIcon = 'expand_more';
                vm.additionalItems = znkHeaderSrv.getAdditionalItems();

                OnBoardingService.isOnBoardingCompleted().then(function (isCompleted) {
                    vm.isOnBoardingCompleted = isCompleted;
                });

                vm.invokeOnClickHandler = function(onClickHandler){
                    $injector.invoke(onClickHandler);
                };

                vm.showPurchaseDialog = function () {
                    purchaseService.showPurchaseDialog();
                };

                vm.showChangePassword = function() {
                    SettingsSrv.showChangePassword();
                };

                vm.showGoalsEdit = function () {
                    userGoalsSelectionService.openEditGoalsDialog({
                        clickOutsideToCloseFlag: true
                    });
                };

                UserProfileService.getProfile().then(function (profile) {
                    vm.userProfile = {
                        username: profile.nickname,
                        email: profile.email
                    };
                });

                vm.znkOpenModal = function () {
                    vm.expandIcon = 'expand_less';
                };

                vm.logout = function () {
                    AuthService.logout();
                    $window.location.replace(ENV.redirectLogout);
                };

                purchaseService.getPurchaseData().then(function (purchaseData) {
                    self.purchaseData = purchaseData;
                });

                $scope.$watch('self.purchaseData', function (newPurchaseState) {
                    $timeout(function () {
                        var hasProVersion = !angular.equals(newPurchaseState, {});
                        self.purchaseState = hasProVersion ? PurchaseStateEnum.PRO.enum : PurchaseStateEnum.NONE.enum;
                        self.subscriptionStatus = hasProVersion ? '.PROFILE_STATUS_PRO' : '.PROFILE_STATUS_BASIC';
                    });
                }, true);


                // function _checkIfHasProVersion() {
                //     purchaseService.hasProVersion().then(function (hasProVersion) {
                //         vm.purchaseState = (hasProVersion) ? PurchaseStateEnum.PRO.enum : PurchaseStateEnum.NONE.enum;
                //         vm.subscriptionStatus = (hasProVersion) ? '.PROFILE_STATUS_PRO' : '.PROFILE_STATUS_BASIC';
                //     });
                // }
                //
                // // vm.subscriptionStatus = '.PROFILE_STATUS_BASIC';
                // var pendingPurchaseProm = purchaseService.getPendingPurchase();
                // if (pendingPurchaseProm) {
                //     vm.purchaseState = PurchaseStateEnum.PENDING.enum;
                //     vm.subscriptionStatus = '.PROFILE_STATUS_PENDING';
                //     pendingPurchaseProm.then(function () {
                //         _checkIfHasProVersion();
                //     });
                // } else {
                //     _checkIfHasProVersion();
                // }

                $scope.$on('$mdMenuClose', function () {
                    vm.expandIcon = 'expand_more';
                });
            }
        });
})(angular);
